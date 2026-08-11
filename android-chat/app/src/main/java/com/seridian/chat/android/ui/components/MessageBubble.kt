package com.seridian.chat.android.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.seridian.chat.android.ui.theme.OthersMessageBg
import com.seridian.chat.android.ui.theme.OthersMessageText
import com.seridian.chat.android.ui.theme.OwnMessageBg
import com.seridian.chat.android.ui.theme.OwnMessageText
import com.seridian.chat.android.ui.theme.TextSecondary
import com.seridian.chat.android.ui.theme.TextTertiary

@Composable
fun MessageBubble(
    senderName: String,
    content: String,
    timestamp: String,
    isOwn: Boolean,
    modifier: Modifier = Modifier
) {
    val bgColor = if (isOwn) OwnMessageBg else OthersMessageBg
    val textColor = if (isOwn) OwnMessageText else OthersMessageText
    val bubbleShape = if (isOwn) {
        RoundedCornerShape(16.dp, 16.dp, 4.dp, 16.dp)
    } else {
        RoundedCornerShape(16.dp, 16.dp, 16.dp, 4.dp)
    }

    Column(
        modifier = modifier.fillMaxWidth(),
        horizontalAlignment = if (isOwn) Alignment.End else Alignment.Start
    ) {
        if (!isOwn) {
            Text(
                text = senderName,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.primary,
                modifier = Modifier.padding(start = 12.dp, bottom = 4.dp)
            )
        }

        Column(
            modifier = Modifier
                .widthIn(max = 280.dp)
                .clip(bubbleShape)
                .background(bgColor)
                .padding(12.dp)
        ) {
            Text(
                text = content,
                style = MaterialTheme.typography.bodyLarge,
                color = textColor
            )

            Text(
                text = timestamp,
                style = MaterialTheme.typography.labelSmall,
                color = if (isOwn) OwnMessageText.copy(alpha = 0.7f) else TextTertiary,
                modifier = Modifier
                    .padding(top = 4.dp)
                    .align(Alignment.End)
            )
        }
    }
}
