import Foundation

public class NotificationManager {
    public static let shared = NotificationManager()
    public func dispatchUrgentNotification(ticket: WardReport) {
        print("Dispatching urgent push alert for \(ticket.ticketId)")
    }
}
