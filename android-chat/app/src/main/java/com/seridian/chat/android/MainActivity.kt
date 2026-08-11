package com.seridian.chat.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.seridian.chat.android.navigation.SeridianChatNavGraph
import com.seridian.chat.android.ui.theme.SeridianChatTheme
import com.seridian.chat.client.ConvexClient
import com.seridian.chat.viewmodel.ChatViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val client = ConvexClient()
        val viewModel = ChatViewModel(client)

        setContent {
            SeridianChatTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    SeridianChatNavGraph(viewModel = viewModel)
                }
            }
        }
    }
}
