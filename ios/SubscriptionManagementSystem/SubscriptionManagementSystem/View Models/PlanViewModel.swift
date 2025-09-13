//
//  PlanViewModel.swift
//  SubscriptionManagementSystem
//
//  Created by Shivam Dubey on 13/07/24.
//
import Foundation
import Combine

@MainActor
class PlanViewModel: ObservableObject {
    @Published var plans: [Plan] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - Fetch Plans
    func fetchPlans() async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            let fetchedPlans: [Plan] = try await APIService.shared.request(
                endpoint: "/plans",
                method: .GET,
                responseType: [Plan].self
            )
            self.plans = fetchedPlans
        } catch {
            self.errorMessage = "Failed to fetch plans: \(error.localizedDescription)"
        }
    }
    
    // MARK: - Create Plan
    func createPlan(plan: Plan) async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            let createdPlan: Plan = try await APIService.shared.request(
                endpoint: "/plans",
                method: .POST,
                body: [
                    "name": plan.name,
                    "price": plan.price,
                    "autoRenewalAllowed": plan.autoRenewalAllowed,
                    "status": plan.status
                ],
                responseType: Plan.self
            )
            self.plans.append(createdPlan)
        } catch {
            self.errorMessage = "Failed to create plan: \(error.localizedDescription)"
        }
    }
    
    // MARK: - Update Plan
    func updatePlan(plan: Plan) async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            let updatedPlan: Plan = try await APIService.shared.request(
                endpoint: "/plans/\(plan.productId)",
                method: .PUT,
                body: [
                    "name": plan.name,
                    "price": plan.price,
                    "autoRenewalAllowed": plan.autoRenewalAllowed,
                    "status": plan.status
                ],
                responseType: Plan.self
            )
            if let index = self.plans.firstIndex(where: { $0.productId == plan.productId }) {
                self.plans[index] = updatedPlan
            }
        } catch {
            self.errorMessage = "Failed to update plan: \(error.localizedDescription)"
        }
    }
    
    // MARK: - Delete Plan
    func deletePlan(planId: Int) async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            _ = try await APIService.shared.request(
                endpoint: "/plans/\(planId)",
                method: .DELETE,
                responseType: EmptyResponse.self
            )
            self.plans.removeAll { $0.productId == planId }
        } catch {
            self.errorMessage = "Failed to delete plan: \(error.localizedDescription)"
        }
    }
}
struct EmptyResponse: Codable {}
