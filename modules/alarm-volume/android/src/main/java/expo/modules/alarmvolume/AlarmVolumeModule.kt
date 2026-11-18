package expo.modules.alarmvolume

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.media.AudioManager
import android.os.Build
import android.os.Bundle
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlin.math.roundToInt

private const val VOLUME_CHANGED_ACTION = "android.media.VOLUME_CHANGED_ACTION"
private const val EXTRA_VOLUME_STREAM_TYPE = "android.media.EXTRA_VOLUME_STREAM_TYPE"

/** The media volume alarms play at: read it, follow its changes, and turn it up for an alarm. */
class AlarmVolumeModule : Module() {
  private var receiver: BroadcastReceiver? = null

  private val audioManager: AudioManager?
    get() = appContext.reactContext?.getSystemService(Context.AUDIO_SERVICE) as? AudioManager

  override fun definition() = ModuleDefinition {
    Name("AlarmVolume")

    Events("onVolumeChange")

    Function("getVolume") {
      return@Function currentVolume()
    }

    AsyncFunction("setVolume") { value: Double ->
      val manager = audioManager ?: return@AsyncFunction false
      val max = manager.getStreamMaxVolume(AudioManager.STREAM_MUSIC)
      val index = (value.coerceIn(0.0, 1.0) * max).roundToInt()
      return@AsyncFunction try {
        // No flags: no volume panel, no sound.
        manager.setStreamVolume(AudioManager.STREAM_MUSIC, index, 0)
        true
      } catch (e: SecurityException) {
        // Some phones refuse while Do Not Disturb is on; the alarm plays at the current volume.
        false
      }
    }

    OnStartObserving("onVolumeChange") {
      val context = appContext.reactContext ?: return@OnStartObserving
      val volumeReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
          if (intent?.getIntExtra(EXTRA_VOLUME_STREAM_TYPE, -1) != AudioManager.STREAM_MUSIC) return
          val volume = currentVolume() ?: return
          sendEvent("onVolumeChange", Bundle().apply { putDouble("volume", volume) })
        }
      }
      val filter = IntentFilter(VOLUME_CHANGED_ACTION)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        context.registerReceiver(volumeReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
      } else {
        context.registerReceiver(volumeReceiver, filter)
      }
      receiver = volumeReceiver
    }

    OnStopObserving("onVolumeChange") {
      val context = appContext.reactContext
      receiver?.let { r -> runCatching { context?.unregisterReceiver(r) } }
      receiver = null
    }
  }

  private fun currentVolume(): Double? {
    val manager = audioManager ?: return null
    val max = manager.getStreamMaxVolume(AudioManager.STREAM_MUSIC)
    if (max <= 0) return null
    return manager.getStreamVolume(AudioManager.STREAM_MUSIC).toDouble() / max
  }
}
