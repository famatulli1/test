package com.dictaphone.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.unit.dp

@Composable
fun WaveformView(
    waveformData: List<Float>,
    progress: Float = 0f,
    modifier: Modifier = Modifier,
    barWidth: Float = 4f,
    barGap: Float = 2f,
    activeColor: Color = MaterialTheme.colorScheme.primary,
    inactiveColor: Color = MaterialTheme.colorScheme.primary.copy(alpha = 0.3f)
) {
    Canvas(
        modifier = modifier
            .fillMaxWidth()
            .height(100.dp)
    ) {
        if (waveformData.isEmpty()) return@Canvas

        val canvasWidth = size.width
        val canvasHeight = size.height
        val effectiveWidth = canvasWidth - paddingStart - paddingEnd
        val maxBars = (effectiveWidth / (barWidth + barGap)).toInt()
        val step = maxOf(1, waveformData.size / maxBars)
        
        val normalizedData = waveformData
            .chunked(step)
            .map { chunk -> chunk.maxOrNull() ?: 0f }
            .take(maxBars)

        val progressX = progress * effectiveWidth

        normalizedData.forEachIndexed { index, amplitude ->
            val x = paddingStart + index * (barWidth + barGap)
            val barHeight = amplitude * canvasHeight * 0.8f
            val startY = (canvasHeight - barHeight) / 2
            val endY = startY + barHeight

            drawLine(
                color = if (x <= progressX) activeColor else inactiveColor,
                start = Offset(x, startY),
                end = Offset(x, endY),
                strokeWidth = barWidth,
                cap = StrokeCap.Round
            )
        }
    }
}

private const val paddingStart = 16f
private const val paddingEnd = 16f
