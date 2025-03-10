package com.dictaphone.data.audio

import android.content.Context
import android.media.MediaPlayer
import android.media.MediaRecorder
import android.os.Build
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import java.io.File
import java.io.FileOutputStream
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AudioRecorderService @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private var recorder: MediaRecorder? = null
    private var player: MediaPlayer? = null
    private var audioFile: File? = null
    
    private val _amplitude = MutableStateFlow(0f)
    val amplitude: Flow<Float> = _amplitude

    fun startRecording(): File {
        val file = File(
            context.cacheDir,
            "recording_${System.currentTimeMillis()}.mp3"
        )

        recorder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            MediaRecorder(context)
        } else {
            @Suppress("DEPRECATION")
            MediaRecorder()
        }.apply {
            setAudioSource(MediaRecorder.AudioSource.MIC)
            setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
            setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
            setOutputFile(FileOutputStream(file).fd)
            setAudioSamplingRate(44100)
            setAudioEncodingBitRate(128000)

            prepare()
            start()
        }

        audioFile = file
        startAmplitudeMonitoring()
        return file
    }

    fun stopRecording(): File? {
        return try {
            recorder?.apply {
                stop()
                release()
            }
            recorder = null
            audioFile
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    fun startPlaying(file: File, onCompletion: () -> Unit) {
        player = MediaPlayer().apply {
            setOnCompletionListener { onCompletion() }
            setDataSource(file.absolutePath)
            prepare()
            start()
        }
    }

    fun stopPlaying() {
        player?.apply {
            stop()
            release()
        }
        player = null
    }

    fun pausePlaying() {
        player?.pause()
    }

    fun resumePlaying() {
        player?.start()
    }

    fun getPlaybackPosition(): Int {
        return player?.currentPosition ?: 0
    }

    fun getPlaybackDuration(): Int {
        return player?.duration ?: 0
    }

    private fun startAmplitudeMonitoring() {
        Thread {
            try {
                while (recorder != null) {
                    val maxAmplitude = recorder?.maxAmplitude ?: 0
                    // Normalize amplitude between 0 and 1
                    val normalizedAmplitude = maxAmplitude / 32768f
                    _amplitude.value = normalizedAmplitude
                    Thread.sleep(50) // Update every 50ms
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }.start()
    }

    fun release() {
        stopRecording()
        stopPlaying()
    }
}
