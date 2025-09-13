//
//  UserViewModel.swift
//  SubscriptionManagementSystem
//
//  Created by Shivam Dubey on 13/09/25.
//
//
//  UserViewModel.swift
//  SubscriptionManagementSystem
//
//  Created by Shivam Dubey on 13/09/25.
//

import Foundation

@MainActor
class UserViewModel: ObservableObject {
    
    // MARK: - Users
    @Published var users: [User] = []
    @Published var selectedUser: User?
    
    // MARK: - Subscriptions
    @Published var userSubscriptions: [Subscription] = []
    
    // MARK: - Loading & Errors
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    // JWT Token from Supabase Auth
    @Published var accessToken: String?
    
    // MARK: - User CRUD Operations
    
    func fetchUsers() async {
        guard let token = accessToken else {
            errorMessage = "Missing access token"
            return
        }
        
        isLoading = true
        defer { isLoading = false }
        
        do {
            let fetchedUsers: [User] = try await APIService.shared.request(
                endpoint: "/users",
                method: .GET,
                token: token,
                responseType: [User].self
            )
            self.users = fetchedUsers
        } catch {
            self.errorMessage = error.localizedDescription
        }
    }
    
    func fetchUser(by id: Int) async {
        guard let token = accessToken else { return }
        
        do {
            let user: User = try await APIService.shared.request(
                endpoint: "/users/\(id)",
                method: .GET,
                token: token,
                responseType: User.self
            )
            self.selectedUser = user
        } catch {
            self.errorMessage = error.localizedDescription
        }
    }
    
    func createUser(name: String, email: String, phone: Int, role: String) async {
        guard let token = accessToken else { return }
        
        let body: [String: Any] = [
            "name": name,
            "email": email,
            "phoneNumber": phone,
            "role": role
        ]
        
        do {
            let newUser: User = try await APIService.shared.request(
                endpoint: "/users",
                method: .POST,
                body: body,
                token: token,
                responseType: User.self
            )
            self.users.append(newUser)
        } catch {
            self.errorMessage = error.localizedDescription
        }
    }
    
    func updateUser(id: Int, name: String?, email: String?, phone: Int?, role: String?) async {
        guard let token = accessToken else { return }
        
        var body: [String: Any] = [:]
        if let name = name { body["name"] = name }
        if let email = email { body["email"] = email }
        if let phone = phone { body["phoneNumber"] = phone }
        if let role = role { body["role"] = role }
        
        do {
            let updatedUser: User = try await APIService.shared.request(
                endpoint: "/users/\(id)",
                method: .PATCH,
                body: body,
                token: token,
                responseType: User.self
            )
            
            if let index = users.firstIndex(where: { $0.id == id }) {
                users[index] = updatedUser
            }
        } catch {
            self.errorMessage = error.localizedDescription
        }
    }
    
    func deleteUser(id: Int) async {
        guard let token = accessToken else { return }
        
        do {
            _ = try await APIService.shared.request(
                endpoint: "/users/\(id)",
                method: .DELETE,
                token: token,
                responseType: EmptyResponse.self
            )
            
            self.users.removeAll { $0.id == id }
        } catch {
            self.errorMessage = error.localizedDescription
        }
    }
    
    // MARK: - Subscription Operations
    
    // Fetch current user's subscriptions
    func fetchUserSubscriptions() async {
            guard let token = accessToken else { return }
            isLoading = true
            defer { isLoading = false }
            
            do {
                let subscriptions: [Subscription] = try await APIService.shared.request(
                    endpoint: "/subscriptions/me",
                    method: .GET,
                    token: token,
                    responseType: [Subscription].self
                )
                self.userSubscriptions = subscriptions
            } catch {
                self.errorMessage = "Failed to fetch subscriptions: \(error.localizedDescription)"
            }
        }
        
        // Subscribe to a new plan
        func subscribe(toPlan plan: Plan) async throws {
            guard let token = accessToken else { return }
            isLoading = true
            defer { isLoading = false }
            
            let body: [String: Any] = ["productId": plan.productId]
            
            let subscription: Subscription = try await APIService.shared.request(
                endpoint: "/subscriptions",
                method: .POST,
                body: body,
                token: token,
                responseType: Subscription.self
            )
            
            self.userSubscriptions.append(subscription)
        }
        
        // Cancel an active subscription
        func cancelSubscription(forPlanId planId: Int) async throws {
            guard let token = accessToken else { return }
            isLoading = true
            defer { isLoading = false }
            
            _ = try await APIService.shared.request(
                endpoint: "/subscriptions/\(planId)/cancel",
                method: .PATCH,
                token: token,
                responseType: EmptyResponse.self
            )
            
            self.userSubscriptions.removeAll { $0.productId == planId }
        }
        
        // Upgrade or downgrade subscription
        func changeSubscription(fromPlanId oldPlanId: Int, toPlan newPlan: Plan) async throws {
            guard let token = accessToken else { return }
            isLoading = true
            defer { isLoading = false }
            
            let body: [String: Any] = ["newProductId": newPlan.productId]
            
            let updatedSubscription: Subscription = try await APIService.shared.request(
                endpoint: "/subscriptions/\(oldPlanId)/change",
                method: .PATCH,
                body: body,
                token: token,
                responseType: Subscription.self
            )
            
            // Replace the old subscription with the updated one
            if let index = self.userSubscriptions.firstIndex(where: { $0.productId == oldPlanId }) {
                self.userSubscriptions[index] = updatedSubscription
            }
        }
}
