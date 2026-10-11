import SwiftUI

public struct SettingsView: View {
    @AppStorage("alertSound") private var alertSound: Bool = true

    public var body: some View {
        Form {
            Toggle("Audible Siren on Critical Overflow", isOn: $alertSound)
        }
        .navigationTitle("Preferences")
    }
}
