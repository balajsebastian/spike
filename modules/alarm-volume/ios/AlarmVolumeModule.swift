import AVFoundation
import ExpoModulesCore

/**
 * The volume alarms play at. iOS doesn't let apps change it, so this only reads it
 * and reports changes (hardware buttons, Control Center).
 */
public class AlarmVolumeModule: Module {
  private var observation: NSKeyValueObservation?

  public func definition() -> ModuleDefinition {
    Name("AlarmVolume")

    Events("onVolumeChange")

    Function("getVolume") { () -> Double in
      return Double(AVAudioSession.sharedInstance().outputVolume)
    }

    AsyncFunction("setVolume") { (_: Double) -> Bool in
      return false
    }

    OnStartObserving("onVolumeChange") {
      let session = AVAudioSession.sharedInstance()
      // outputVolume only updates while the session is active. Only activate once expo-audio has set its
      // playback category (which mixes with other apps): the default category would stop other apps' audio.
      if session.category != .soloAmbient {
        try? session.setActive(true)
      }
      self.observation = session.observe(\.outputVolume, options: [.new]) { [weak self] _, change in
        guard let volume = change.newValue else { return }
        self?.sendEvent("onVolumeChange", ["volume": Double(volume)])
      }
    }

    OnStopObserving("onVolumeChange") {
      self.observation?.invalidate()
      self.observation = nil
    }
  }
}
