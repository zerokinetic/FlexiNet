//
//  Models.swift
//  SubscriptionManagementSystem
//
//  Created by Shivam Dubey on 13/09/25.
//

import Foundation
import SwiftUICore


struct User: Codable, Identifiable {
    let id: Int
    let name: String
    let email: String
    let phoneNumber: Int
    let role: String
    let createdAt: String? // optional, depends if backend returns it
    let updatedAt: String? // optional
    
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case email
        case phoneNumber
        case role
        case createdAt
        case updatedAt
    }
}



import Foundation

struct Plan: Codable, Identifiable {
    var id: Int { productId }
    let productId: Int
    var name: String
    var price: Double
    var autoRenewalAllowed: Bool
    var status: String
}


import Foundation

struct Subscription: Identifiable, Codable {
    let id: Int
    let userId: Int
    let productId: Int
    var status: String
    let startDate: Date
    var lastBilledDate: Date?
    var lastRenewedDate: Date?
    var terminatedDate: Date?
    let graceTime: Int
    
    // Optional plan info for easier UI rendering
    var plan: Plan?
}

struct SubscriptionLog: Identifiable, Codable {
    let id: Int
    let subscriptionId: Int
    let currentStatus: String
    let nextStatus: String
    let action: String
    let actionDate: Date
}
