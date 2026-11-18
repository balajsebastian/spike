Pod::Spec.new do |s|
  s.name           = 'AlarmVolume'
  s.version        = '1.0.0'
  s.summary        = 'Reads the media volume for Spike alarms'
  s.description    = 'Reads the system output volume and reports changes, so Spike can warn when alarms would be too quiet.'
  s.author         = ''
  s.homepage       = 'https://github.com/balajsebastian/spike'
  s.platforms      = {
    :ios => '16.4'
  }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = "**/*.{h,m,swift}"
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }
end
