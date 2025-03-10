package com.dictaphone.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.dictaphone.ui.screens.recorder.RecorderScreen
import com.dictaphone.ui.theme.DictaphoneTheme
import com.dictaphone.util.PermissionManager
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    private lateinit var permissionManager: PermissionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        permissionManager = PermissionManager(this)

        setContent {
            val permissionGranted by permissionManager.audioPermissionGranted.collectAsState()

            LaunchedEffect(Unit) {
                permissionManager.checkAndRequestPermissions()
            }

            DictaphoneTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    if (permissionGranted) {
                        val navController = rememberNavController()
                        
                        NavHost(
                            navController = navController,
                            startDestination = "recorder"
                        ) {
                            composable("recorder") {
                                RecorderScreen(
                                    onNavigateToRecordings = {
                                        navController.navigate("recordings")
                                    }
                                )
                            }
                            composable("recordings") {
                                // TODO: Implement RecordingsScreen
                            }
                        }
                    } else {
                        PermissionRequest(
                            onRequestPermission = {
                                permissionManager.checkAndRequestPermissions()
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun PermissionRequest(
    onRequestPermission: () -> Unit
) {
    androidx.compose.material3.AlertDialog(
        onDismissRequest = { },
        title = { androidx.compose.material3.Text("Permission requise") },
        text = { 
            androidx.compose.material3.Text(
                "L'application a besoin de la permission d'accéder au microphone pour fonctionner."
            )
        },
        confirmButton = {
            androidx.compose.material3.TextButton(onClick = onRequestPermission) {
                androidx.compose.material3.Text("Autoriser")
            }
        }
    )
}
