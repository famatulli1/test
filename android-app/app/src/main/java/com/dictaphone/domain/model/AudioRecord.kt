package com.dictaphone.domain.model

import java.io.File

data class AudioRecord(
    val id: String,
    val file: File,
    val duration: Long,
    val timestamp: Long,
    val transcription: String? = null
)

sealed class RecordingState {
    data object Idle : RecordingState()
    data object Recording : RecordingState()
    data class Playing(val progress: Float = 0f) : RecordingState()
    data class Error(val message: String) : RecordingState()
}

data class RecorderUiState(
    val recordingState: RecordingState = RecordingState.Idle,
    val duration: Long = 0L,
    val waveformData: List<Float> = emptyList(),
    val isTranscribing: Boolean = false,
    val error: String? = null
)
