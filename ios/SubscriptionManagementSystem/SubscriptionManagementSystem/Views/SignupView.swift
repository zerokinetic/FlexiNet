//
//  SignupView.swift
//  SubscriptionManagementSystem
//
//  Created by Shivam Dubey on 13/09/25.
//


import SwiftUI

struct SignupView: View {
    @ObservedObject var authVM: AuthViewModel
    
    @State private var name = ""
    @State private var email = ""
    @State private var phone = ""
    @State private var password = ""
    @State private var role = "user"
    
    let roles = ["user", "admin"]
    
    var body: some View {
        VStack(spacing: 25) {
            Text("Create Account")
                .font(.largeTitle)
                .bold()
            
            VStack(alignment: .leading, spacing: 15) {
                TextField("Name", text: $name)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                
                TextField("Email", text: $email)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .autocapitalization(.none)
                
                TextField("Phone", text: $phone)
                    .keyboardType(.numberPad)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                
                SecureField("Password", text: $password)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                
                Picker("Role", selection: $role) {
                    ForEach(roles, id: \.self) { r in
                        Text(r.capitalized).tag(r)
                    }
                }
                .pickerStyle(SegmentedPickerStyle())
            }
            .padding(.horizontal, 30)
            
            Button(action: {
                Task {
                    if let phoneInt = Int(phone) {
                        await authVM.signup(
                            name: name,
                            email: email,
                            phone: phoneInt,
                            password: password,
                            role: role
                        )
                    }
                }
            }) {
                Text("Sign Up")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.green)
                    .foregroundColor(.white)
                    .cornerRadius(12)
            }
            .padding(.horizontal, 30)
            
            Spacer()
        }
        .padding()
    }
}
