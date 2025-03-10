package com.dictaphone.ui.screens.recorder

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.dictaphone.domain.model.RecordingState
import com.dictaphone.ui.components.WaveformView
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun RecorderScreen(
    onNavigateToRecordings: () -> Unit,
    viewModel: RecorderViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        TopAppBar(
            title = { Text("Dictaphone") },
            colors = TopAppBarDefaults.topAppBarColors(
                containerColor = MaterialTheme.colorScheme.primary,
                titleContentColor = MaterialTheme.colorScheme.onPrimary,
                navigationIconContentColor = MaterialTheme.colorScheme.onPrimary,
                actionIconContentColor = MaterialTheme.colorScheme.onPrimary
            ),
            actions = {
                IconButton(onClick = onNavigateToRecordings) {
                    Icon(Icons.Default.List, contentDescription = "Liste des enregistrements")
                }
            }
        )

        Spacer(modifier = Modifier.height(32.dp))

        // Timer
        Text(
            text = formatDuration(uiState.duration),
            style = MaterialTheme.typography.displayLarge,
            color = MaterialTheme.colorScheme.primary
        )

        Spacer(modifier = Modifier.height(32.dp))

        // Waveform
        WaveformView(
            waveformData = uiState.waveformData,
            progress = when (val state = uiState.recordingState) {
                is RecordingState.Playing -> state.progress
                else -> 0f
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(200.dp)
        )

        Spacer(modifier = Modifier.height(32.dp))

        // Recording Controls
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            when (uiState.recordingState) {
                is RecordingState.Idle -> {
                    FloatingActionButton(
                        onClick = { viewModel.startRecording() },
                        containerColor = MaterialTheme.colorScheme.primary
                    ) {
                        Icon(Icons.Default.Mic, "Démarrer l'enregistrement")
                    }
                }
                is RecordingState.Recording -> {
                    FloatingActionButton(
                        onClick = { viewModel.stopRecording() },
                        containerColor = MaterialTheme.colorScheme.error
                    ) {
                        Icon(Icons.Default.Stop, "Arrêter l'enregistrement")
                    }
                }
                is RecordingState.Playing -> {
                    FloatingActionButton(
                        onClick = { viewModel.pausePlayback() },
                        containerColor = MaterialTheme.colorScheme.primary
                    ) {
                        Icon(Icons.Default.Pause, "Mettre en pause")
                    }
                }
                is RecordingState.Error -> {
                    FloatingActionButton(
                        onClick = { viewModel.startRecording() },
                        containerColor = MaterialTheme.colorScheme.error
                    ) {
                        Icon(Icons.Default.Mic, "Réessayer l'enregistrement")
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Transcription Status
        AnimatedVisibility(visible = uiState.isTranscribing) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                CircularProgressIndicator(
                    modifier = Modifier.size(16.dp),
                    strokeWidth = 2.dp
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    "Transcription en cours...",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.secondary
                )
            }
        }

        // Error Message
        AnimatedVisibility(visible = uiState.error != null) {
            uiState.error?.let { error ->
                Snackbar(
                    modifier = Modifier.padding(16.dp),
                    action = {
                        TextButton(onClick = { viewModel.dismissError() }) {
                            Text("OK")
                        }
                    }
                ) {
                    Text(error)
                }
            }
        }
    }
}

private fun formatDuration(durationMs: Long): String {
    val seconds = (durationMs / 1000) % 60
    val minutes = (durationMs / (1000 * 60)) % 60
    return String.format("%02d:%02d", minutes, seconds)
}
