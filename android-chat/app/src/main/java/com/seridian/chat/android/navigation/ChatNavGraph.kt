package com.seridian.chat.android.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.seridian.chat.android.ui.screens.ChatListScreen
import com.seridian.chat.android.ui.screens.LoginScreen
import com.seridian.chat.android.ui.screens.MessageScreen
import com.seridian.chat.viewmodel.ChatViewModel

@Composable
fun SeridianChatNavGraph(viewModel: ChatViewModel) {
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = "login"
    ) {
        composable("login") {
            LoginScreen(
                viewModel = viewModel,
                onConnected = {
                    navController.navigate("channels") {
                        popUpTo("login") { inclusive = true }
                    }
                }
            )
        }

        composable("channels") {
            ChatListScreen(
                viewModel = viewModel,
                onChannelClick = { channelId ->
                    viewModel.selectChannel(channelId)
                    navController.navigate("messages/$channelId")
                }
            )
        }

        composable(
            route = "messages/{channelId}",
            arguments = listOf(
                navArgument("channelId") { type = NavType.StringType }
            )
        ) {
            MessageScreen(
                viewModel = viewModel,
                onBack = { navController.popBackStack() }
            )
        }
    }
}
