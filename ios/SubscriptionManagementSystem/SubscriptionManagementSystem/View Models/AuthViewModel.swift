//
//  AuthViewModel.swift
//  SubscriptionManagementSystem
//
//  Created by Shivam Dubey on 13/09/25.
//

import Foundation

@MainActor
class AuthViewModel: ObservableObject {
    @Published var currentUser: User?
    @Published var isAuthenticated = false
    @Published var errorMessage: String?
    @Published var isLoading = false
    @Published var accessToken: String?
    
    private let userVM = UserViewModel()
    
    init() {
        loadUserFromDefaults()
    }
    
    // MARK: - Login
    func login(email: String, password: String) async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            let response: AuthResponse = try await APIService.shared.request(
                endpoint: "/user/signin",
                method: .POST,
                body: [
                    "email": email,
                    "password": password
                ],
                responseType: AuthResponse.self
            )
            
            // Save user and token
            setUserSession(user: response.user, token: response.token)
            
        } catch {
            self.errorMessage = "Login failed: \(error.localizedDescription)"
        }
    }
    
    // MARK: - Signup
    func signup(name: String, email: String, phone: Int, password: String, role: String) async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            let response: AuthResponse = try await APIService.shared.request(
                endpoint: "/user/signup",
                method: .POST,
                body: [
                    "name": name,
                    "email": email,
                    "phoneNumber": phone,
                    "password": password,
                    "role": role
                ],
                responseType: AuthResponse.self
            )
            
            // Save user and token
            setUserSession(user: response.user, token: response.token)
            
        } catch {
            self.errorMessage = "Signup failed: \(error.localizedDescription)"
        }
    }
    
    // MARK: - Logout
    func logout() {
        self.currentUser = nil
        self.isAuthenticated = false
        self.accessToken = nil
        UserDefaults.standard.removeObject(forKey: "currentUser")
        UserDefaults.standard.removeObject(forKey: "access_token")
    }
    
    // MARK: - Session Persistence
    private func setUserSession(user: User, token: String) {
        self.currentUser = user
        self.isAuthenticated = true
        self.accessToken = token
        self.userVM.accessToken = token
        
        if let encoded = try? JSONEncoder().encode(user) {
            UserDefaults.standard.set(encoded, forKey: "currentUser")
            UserDefaults.standard.set(token, forKey: "access_token")
        }
    }

    private func loadUserFromDefaults() {
        if let savedData = UserDefaults.standard.data(forKey: "currentUser"),
           let savedUser = try? JSONDecoder().decode(User.self, from: savedData) {
            self.currentUser = savedUser
            self.isAuthenticated = true
            self.accessToken = UserDefaults.standard.string(forKey: "access_token")
            self.userVM.accessToken = self.accessToken
        }
    }
}
struct AuthResponse: Codable {
    let user: User
    let token: String
}
