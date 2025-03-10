package com.dictaphone.ui.screens.recorder

import android.content.SharedPreferences
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dictaphone.data.api.WhisperService
import com.dictaphone.data.audio.AudioRecorderService
import com.dictaphone.domain.model.RecorderUiState
import com.dictaphone.domain.model.RecordingState
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.io.File
import javax.inject.Inject

@HiltViewModel
class RecorderViewModel @Inject constructor(
    private val audioRecorderService: AudioRecorderService,
    private val whisperService: WhisperService,
    private val sharedPreferences: SharedPreferences
) : ViewModel() {

    private val _uiState = MutableStateFlow(RecorderUiState())
    val uiState: StateFlow<RecorderUiState> = _uiState

    private var currentFile: File? = null
    private var recordingStartTime: Long = 0

    init {
        viewModelScope.launch {
            audioRecorderService.amplitude.collect { amplitude ->
                _uiState.update { state ->
                    state.copy(
                        waveformData = state.waveformData + amplitude
                    )
                }
            }
        }
    }

    fun startRecording() {
        viewModelScope.launch {
            try {
                currentFile = audioRecorderService.startRecording()
                recordingStartTime = System.currentTimeMillis()
                _uiState.update { it.copy(
                    recordingState = RecordingState.Recording,
                    waveformData = emptyList()
                )}

                // Update duration periodically
                while (_uiState.value.recordingState is RecordingState.Recording) {
                    _uiState.update { it.copy(
                        duration = System.currentTimeMillis() - recordingStartTime
                    )}
                    kotlinx.coroutines.delay(100)
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(
                    recordingState = RecordingState.Error(e.message ?: "Failed to start recording"),
                    error = e.message
                )}
            }
        }
    }

    fun stopRecording() {
        viewModelScope.launch {
            currentFile = audioRecorderService.stopRecording()
            _uiState.update { it.copy(recordingState = RecordingState.Idle) }
            
            currentFile?.let { file ->
                transcribeAudio(file)
            }
        }
    }

    private fun transcribeAudio(file: File) {
        viewModelScope.launch {
            _uiState.update { it.copy(isTranscribing = true) }
            
            try {
                val apiKey = sharedPreferences.getString("openai_api_key", "") ?: ""
                if (apiKey.isBlank()) {
                    throw Exception("OpenAI API key not found")
                }

                whisperService.transcribe(apiKey, file)
                    .onSuccess { transcription ->
                        _uiState.update { it.copy(
                            isTranscribing = false,
                            error = null
                        )}
                    }
                    .onFailure { error ->
                        _uiState.update { it.copy(
                            isTranscribing = false,
                            error = error.message
                        )}
                    }
            } catch (e: Exception) {
                _uiState.update { it.copy(
                    isTranscribing = false,
                    error = e.message
                )}
            }
        }
    }

    fun playRecording() {
        viewModelScope.launch {
            currentFile?.let { file ->
                audioRecorderService.startPlaying(file) {
                    // On completion
                    _uiState.update { it.copy(
                        recordingState = RecordingState.Idle
                    )}
                }
                _uiState.update { it.copy(
                    recordingState = RecordingState.Playing()
                )}
            }
        }
    }

    fun pausePlayback() {
        audioRecorderService.pausePlaying()
        _uiState.update { it.copy(
            recordingState = RecordingState.Idle
        )}
    }

    fun dismissError() {
        _uiState.update { it.copy(error = null) }
    }

    override fun onCleared() {
        super.onCleared()
        audioRecorderService.release()
    }
}
