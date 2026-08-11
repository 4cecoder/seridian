package com.seridian.chat.android.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.seridian.chat.android.ui.theme.SeridianCyan
import com.seridian.chat.android.ui.theme.Surface2
import com.seridian.chat.android.ui.theme.TextPrimary

@Composable
fun UserAvatar(
    name: String,
    modifier: Modifier = Modifier
) {
    val initial = name.firstOrNull()?.uppercase() ?: "?"

    Box(
        modifier = modifier
            .size(40.dp)
            .clip(CircleShape)
            .background(Surface2),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = initial,
            color = SeridianCyan,
            fontSize = 16.sp,
            fontWeight = FontWeight.SemiBold
        )
    }
}
