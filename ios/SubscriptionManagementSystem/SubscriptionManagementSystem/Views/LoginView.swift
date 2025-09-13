//
//  LoginView.swift
//  SubscriptionManagementSystem
//
//  Created by Shivam Dubey on 13/09/25.
//


import SwiftUI

struct LoginView: View {
    @StateObject private var authVM = AuthViewModel()
    
    @State private var email = ""
    @State private var password = ""
    @State private var navigateToSignup = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 25) {
                
                Text("Subscription Manager")
                    .font(.largeTitle)
                    .bold()
                    .foregroundColor(.blue)
                
                VStack(alignment: .leading, spacing: 15) {
                    TextField("Email", text: $email)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .autocapitalization(.none)
                    
                    SecureField("Password", text: $password)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                }
                .padding(.horizontal, 30)
                
                if let error = authVM.errorMessage {
                    Text(error)
                        .foregroundColor(.red)
                        .font(.caption)
                }
                
                Button(action: {
                    Task {
                        await authVM.login(email: email, password: password)
                    }
                }) {
                    Text("Login")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                }
                .padding(.horizontal, 30)
                
                NavigationLink("Don’t have an account? Sign up",
                               destination: SignupView(authVM: authVM),
                               isActive: $navigateToSignup)
                    .font(.footnote)
                
                Spacer()
            }
            .padding()
            .navigationBarHidden(true)
        }
    }
}
