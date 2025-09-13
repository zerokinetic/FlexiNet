import streamlit as st
import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# ===============================
# PAGE CONFIG
# ===============================
st.set_page_config(
    page_title="Lumen Quest 2.0 - AI Plan Recommender",
    layout="wide",
    initial_sidebar_state="expanded",
    page_icon="🚀"
)

# ===============================
# STYLING
# ===============================
st.markdown("""
<style>
.main-header {
    font-size: 2.5rem;
    color: #1E88E5;
    text-align: center;
    margin-bottom: 2rem;
    font-weight: bold;
}
.metric-card {
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    padding: 1rem;
    border-radius: 10px;
    color: white;
    text-align: center;
    margin: 0.5rem 0;
}
.recommendation-card {
    border-left: 5px solid #4CAF50;
    background: #E8F5E8;
    padding: 1rem;
    margin: 0.5rem 0;
    border-radius: 0 10px 10px 0;
}
.user-profile-card {
    background: #F8F9FA;
    padding: 1rem;
    border-radius: 10px;
    border: 1px solid #E9ECEF;
}
.plan-card {
    background: #FFFFFF;
    padding: 1rem;
    border-radius: 10px;
    border: 1px solid #E9ECEF;
    margin: 0.5rem 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>
""", unsafe_allow_html=True)

# ===============================
# DATA LOADING AND PROCESSING
# ===============================
@st.cache_data
def load_hackathon_data():
    """Load the actual hackathon dataset"""
    try:
        # Load all CSV files
        users = pd.read_csv('User_Data.csv')
        subscriptions = pd.read_csv('Subscriptions.csv')
        plans = pd.read_csv('Subscription_Plans.csv')
        billing = pd.read_csv('Billing_Information.csv')
        logs = pd.read_csv('Subscription_Logs.csv')
        
        # Convert date columns
        subscriptions['Start Date'] = pd.to_datetime(subscriptions['Start Date'], errors='coerce')
        subscriptions['Last Billed Date'] = pd.to_datetime(subscriptions['Last Billed Date'], errors='coerce')
        subscriptions['Last Renewed Date'] = pd.to_datetime(subscriptions['Last Renewed Date'], errors='coerce')
        
        return users, subscriptions, plans, billing, logs
    except FileNotFoundError as e:
        st.error(f"Data file not found: {e}")
        st.error("Please ensure all CSV files are in the working directory")
        return None, None, None, None, None

def create_user_profiles(users, subscriptions, plans, billing):
    """Create user profiles from subscription history"""
    user_profiles = []
    
    for _, user in users.iterrows():
        user_id = user['User Id']
        user_subs = subscriptions[subscriptions['User Id'] == user_id]
        
        if len(user_subs) > 0:
            # Merge with plan details
            subs_with_plans = user_subs.merge(plans, on='Product Id', how='left')
            
            # Calculate user preferences
            avg_price = subs_with_plans['Price'].mean()
            total_subscriptions = len(user_subs)
            active_subscriptions = len(user_subs[user_subs['Status'] == 'active'])
            retention_rate = active_subscriptions / total_subscriptions if total_subscriptions > 0 else 0
            
            # Preferred subscription type
            preferred_type = user_subs['Subscription Type'].mode()
            preferred_type = preferred_type.iloc[0] if len(preferred_type) > 0 else 'monthly'
            
            # Auto renewal preference
            auto_renewal_count = (subs_with_plans['Auto Renewal Allowed'] == 'Yes').sum()
            prefers_auto_renewal = auto_renewal_count > len(subs_with_plans) / 2
            
            # Price category
            if avg_price < 40:
                price_category = 'Budget'
            elif avg_price < 70:
                price_category = 'Standard'
            else:
                price_category = 'Premium'
            
            # Current active plans
            current_plans = user_subs[user_subs['Status'] == 'active']['Product Id'].tolist()
            
            profile = {
                'User Id': user_id,
                'Name': user['Name'],
                'User Status': user['Status'],
                'avg_price_preference': avg_price,
                'preferred_subscription_type': preferred_type,
                'prefers_auto_renewal': prefers_auto_renewal,
                'total_subscriptions': total_subscriptions,
                'active_subscriptions': active_subscriptions,
                'retention_rate': retention_rate,
                'price_category': price_category,
                'current_plans': current_plans
            }
        else:
            # New user with no history
            profile = {
                'User Id': user_id,
                'Name': user['Name'],
                'User Status': user['Status'],
                'avg_price_preference': 50.0,
                'preferred_subscription_type': 'monthly',
                'prefers_auto_renewal': True,
                'total_subscriptions': 0,
                'active_subscriptions': 0,
                'retention_rate': 0.0,
                'price_category': 'Standard',
                'current_plans': []
            }
        
        user_profiles.append(profile)
    
    return pd.DataFrame(user_profiles)

# ===============================
# ML RECOMMENDATION ENGINE
# ===============================
class LumenPlanRecommendationEngine:
    def __init__(self, users, subscriptions, plans, user_profiles, billing):
        self.users = users
        self.subscriptions = subscriptions
        self.plans = plans
        self.user_profiles = user_profiles
        self.billing = billing
        self.setup_recommendation_system()
    
    def setup_recommendation_system(self):
        """Setup the ML recommendation system"""
        self.create_interaction_matrix()
        self.setup_content_based_features()
        self.setup_collaborative_filtering()
    
    def create_interaction_matrix(self):
        """Create user-plan interaction matrix"""
        interactions = []
        
        # Create interactions based on subscription history
        for _, sub in self.subscriptions.iterrows():
            user_id = sub['User Id']
            plan_id = sub['Product Id']
            
            # Base interaction score
            score = 3.0
            
            # Boost for active subscriptions
            if sub['Status'] == 'active':
                score += 1.5
            elif sub['Status'] == 'PAUSED':
                score -= 0.5
            
            # Boost for yearly subscriptions (more commitment)
            if sub['Subscription Type'] == 'yearly':
                score += 0.5
            
            interactions.append({
                'user_id': user_id,
                'plan_id': plan_id,
                'rating': max(1.0, min(5.0, score))
            })
        
        self.interactions_df = pd.DataFrame(interactions)
        
        # Create pivot table for collaborative filtering
        if len(self.interactions_df) > 0:
            self.user_item_matrix = self.interactions_df.pivot_table(
                index='user_id', columns='plan_id', values='rating', fill_value=0
            )
        else:
            self.user_item_matrix = pd.DataFrame()
    
    def setup_content_based_features(self):
        """Setup content-based recommendation features"""
        # Normalize plan features
        plan_features = self.plans.copy()
        plan_features['auto_renewal_score'] = (plan_features['Auto Renewal Allowed'] == 'Yes').astype(int)
        
        # Normalize price (0-1 scale)
        price_min, price_max = plan_features['Price'].min(), plan_features['Price'].max()
        plan_features['price_normalized'] = (plan_features['Price'] - price_min) / (price_max - price_min)
        
        self.plan_features_normalized = plan_features
        
        # Normalize user profile features
        profile_features = self.user_profiles.copy()
        profile_features['auto_renewal_score'] = profile_features['prefers_auto_renewal'].astype(int)
        profile_features['price_normalized'] = (profile_features['avg_price_preference'] - price_min) / (price_max - price_min)
        
        self.user_features_normalized = profile_features
    
    def setup_collaborative_filtering(self):
        """Setup collaborative filtering model"""
        if len(self.user_item_matrix) > 1:
            self.cf_model = NearestNeighbors(
                n_neighbors=min(5, len(self.user_item_matrix)), 
                algorithm='brute', 
                metric='cosine'
            )
            self.cf_model.fit(self.user_item_matrix.values)
    
    def get_content_based_recommendations(self, user_id, top_n=5):
        """Generate content-based recommendations"""
        user_profile = self.user_features_normalized[
            self.user_features_normalized['User Id'] == user_id
        ]
        
        if len(user_profile) == 0:
            return self.get_popular_plans(top_n)
        
        user_profile = user_profile.iloc[0]
        current_plans = user_profile['current_plans']
        
        # Calculate similarity scores for all plans
        plan_scores = []
        
        for _, plan in self.plan_features_normalized.iterrows():
            if plan['Product Id'] in current_plans:
                continue  # Skip current plans
            
            # Price similarity
            price_diff = abs(user_profile['price_normalized'] - plan['price_normalized'])
            price_score = 1.0 - price_diff
            
            # Auto renewal preference match
            auto_renewal_match = 1.0 if user_profile['auto_renewal_score'] == plan['auto_renewal_score'] else 0.3
            
            # Subscription type preference (boost for matching type)
            type_boost = 1.2 if user_profile['preferred_subscription_type'] == 'yearly' and plan['Price'] > 50 else 1.0
            
            # Combined score
            final_score = (price_score * 0.6 + auto_renewal_match * 0.4) * type_boost
            
            plan_scores.append({
                'plan_id': plan['Product Id'],
                'plan_name': plan['Name'],
                'price': plan['Price'],
                'auto_renewal': plan['Auto Renewal Allowed'],
                'score': final_score
            })
        
        # Sort by score and return top N
        plan_scores.sort(key=lambda x: x['score'], reverse=True)
        return plan_scores[:top_n]
    
    def get_collaborative_recommendations(self, user_id, top_n=5):
        """Generate collaborative filtering recommendations"""
        try:
            if user_id not in self.user_item_matrix.index or len(self.user_item_matrix) < 2:
                return []
            
            user_idx = self.user_item_matrix.index.get_loc(user_id)
            user_ratings = self.user_item_matrix.iloc[user_idx].values.reshape(1, -1)
            
            # Find similar users
            distances, indices = self.cf_model.kneighbors(user_ratings)
            similar_users = self.user_item_matrix.iloc[indices[0]]
            
            # Get current user's plans
            current_plans = self.user_profiles[
                self.user_profiles['User Id'] == user_id
            ]['current_plans'].iloc[0]
            
            # Calculate recommendations based on similar users
            plan_scores = []
            
            for plan_id in self.user_item_matrix.columns:
                if plan_id in current_plans:
                    continue
                    
                # Skip if user already has this plan
                if self.user_item_matrix.iloc[user_idx, self.user_item_matrix.columns.get_loc(plan_id)] > 0:
                    continue
                
                # Get ratings from similar users for this plan
                similar_ratings = similar_users.iloc[:, self.user_item_matrix.columns.get_loc(plan_id)]
                non_zero_ratings = similar_ratings[similar_ratings > 0]
                
                if len(non_zero_ratings) > 0:
                    avg_rating = non_zero_ratings.mean()
                    plan_info = self.plans[self.plans['Product Id'] == plan_id].iloc[0]
                    
                    plan_scores.append({
                        'plan_id': plan_id,
                        'plan_name': plan_info['Name'],
                        'price': plan_info['Price'],
                        'auto_renewal': plan_info['Auto Renewal Allowed'],
                        'score': avg_rating / 5.0  # Normalize to 0-1
                    })
            
            plan_scores.sort(key=lambda x: x['score'], reverse=True)
            return plan_scores[:top_n]
            
        except Exception as e:
            return []
    
    def get_hybrid_recommendations(self, user_id, top_n=5):
        """Generate hybrid recommendations combining both approaches"""
        content_recs = self.get_content_based_recommendations(user_id, top_n * 2)
        collab_recs = self.get_collaborative_recommendations(user_id, top_n * 2)
        
        # Combine scores with weights
        combined_scores = {}
        
        # Content-based weight: 70%
        for rec in content_recs:
            combined_scores[rec['plan_id']] = {
                'score': rec['score'] * 0.7,
                'plan_name': rec['plan_name'],
                'price': rec['price'],
                'auto_renewal': rec['auto_renewal']
            }
        
        # Collaborative weight: 30%
        for rec in collab_recs:
            if rec['plan_id'] in combined_scores:
                combined_scores[rec['plan_id']]['score'] += rec['score'] * 0.3
            else:
                combined_scores[rec['plan_id']] = {
                    'score': rec['score'] * 0.3,
                    'plan_name': rec['plan_name'],
                    'price': rec['price'],
                    'auto_renewal': rec['auto_renewal']
                }
        
        # Sort and format final recommendations
        final_recs = []
        for plan_id, data in combined_scores.items():
            final_recs.append({
                'plan_id': plan_id,
                'plan_name': data['plan_name'],
                'price': data['price'],
                'auto_renewal': data['auto_renewal'],
                'score': data['score']
            })
        
        final_recs.sort(key=lambda x: x['score'], reverse=True)
        return final_recs[:top_n]
    
    def get_popular_plans(self, top_n=5):
        """Get most popular plans as fallback"""
        plan_popularity = self.subscriptions['Product Id'].value_counts()
        popular_plan_ids = plan_popularity.head(top_n).index.tolist()
        
        popular_plans = []
        for plan_id in popular_plan_ids:
            plan_info = self.plans[self.plans['Product Id'] == plan_id].iloc[0]
            popular_plans.append({
                'plan_id': plan_id,
                'plan_name': plan_info['Name'],
                'price': plan_info['Price'],
                'auto_renewal': plan_info['Auto Renewal Allowed'],
                'score': 0.8  # Default score for popular plans
            })
        
        return popular_plans
    
    def explain_recommendation(self, user_id, plan_id):
        """Explain why a plan was recommended"""
        user_profile = self.user_profiles[self.user_profiles['User Id'] == user_id]
        plan = self.plans[self.plans['Product Id'] == plan_id].iloc[0]
        
        explanations = []
        
        if len(user_profile) > 0:
            user_profile = user_profile.iloc[0]
            
            # Price explanation
            price_diff = abs(user_profile['avg_price_preference'] - plan['Price'])
            if price_diff < 20:
                explanations.append(
                    f"💰 Great price match! Plan costs ${plan['Price']:.2f}, "
                    f"close to your preference of ${user_profile['avg_price_preference']:.2f}"
                )
            
            # Auto renewal explanation
            if (user_profile['prefers_auto_renewal'] and plan['Auto Renewal Allowed'] == 'Yes') or \
               (not user_profile['prefers_auto_renewal'] and plan['Auto Renewal Allowed'] == 'No'):
                explanations.append(
                    f"🔄 Auto-renewal setting ({plan['Auto Renewal Allowed']}) matches your preference"
                )
            
            # Subscription type explanation
            if user_profile['preferred_subscription_type'] == 'yearly' and plan['Price'] > 50:
                explanations.append("📅 Premium plan suitable for yearly subscribers")
            elif user_profile['preferred_subscription_type'] == 'monthly':
                explanations.append("📅 Flexible plan good for monthly subscribers")
            
            # Retention rate explanation
            if user_profile['retention_rate'] > 0.7:
                explanations.append("⭐ You're a loyal customer - this plan rewards long-term users")
        
        if not explanations:
            explanations.append("✨ This plan is popular among users with similar profiles")
        
        return explanations

# ===============================
# STREAMLIT APPLICATION
# ===============================
def main():
    # Header
    st.markdown('<h1 class="main-header">🚀 Lumen Quest 2.0 - AI Plan Recommender</h1>', 
                unsafe_allow_html=True)
    
    
    
    
    # Load data
    with st.spinner("Loading hackathon dataset..."):
        users, subscriptions, plans, billing, logs = load_hackathon_data()
    
    if users is None:
        st.stop()
    
    # Create user profiles
    with st.spinner("Creating user profiles and initializing AI engine..."):
        user_profiles = create_user_profiles(users, subscriptions, plans, billing)
        rec_engine = LumenPlanRecommendationEngine(users, subscriptions, plans, user_profiles, billing)
    
    # Sidebar navigation
    st.sidebar.title("🎯 Navigation")
    page = st.sidebar.selectbox("Choose Feature", [
        "🏠 Dashboard Overview",
        "🤖 AI Recommendations",
        "📊 Analytics & Insights",
        "🔍 Plan Explorer"
    ])
    
    if page == "🏠 Dashboard Overview":
        show_dashboard_overview(users, subscriptions, plans, user_profiles, billing)
    elif page == "🤖 AI Recommendations":
        show_ai_recommendations(rec_engine, users, user_profiles)
    elif page == "📊 Analytics & Insights":
        show_analytics_insights(subscriptions, plans, user_profiles, billing)
    elif page == "🔍 Plan Explorer":
        show_plan_explorer(plans, subscriptions)

def show_dashboard_overview(users, subscriptions, plans, user_profiles, billing):
    """Dashboard overview page"""
    st.subheader("📊 System Overview")
    
    # Key metrics
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.markdown(f"""
        <div class="metric-card">
            <h3>{len(users):,}</h3>
            <p>Total Users</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        active_subs = len(subscriptions[subscriptions['Status'] == 'active'])
        st.markdown(f"""
        <div class="metric-card">
            <h3>{active_subs:,}</h3>
            <p>Active Subscriptions</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown(f"""
        <div class="metric-card">
            <h3>{len(plans):,}</h3>
            <p>Available Plans</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col4:
        avg_price = plans['Price'].mean()
        st.markdown(f"""
        <div class="metric-card">
            <h3>${avg_price:.2f}</h3>
            <p>Average Plan Price</p>
        </div>
        """, unsafe_allow_html=True)
    
    # Charts
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("📈 Subscription Status Distribution")
        status_counts = subscriptions['Status'].value_counts()
        fig = px.pie(values=status_counts.values, names=status_counts.index,
                    title="Active vs Paused Subscriptions",
                    color_discrete_sequence=['#4CAF50', '#FF9800'])
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        st.subheader("💰 Plan Price Distribution")
        fig = px.histogram(plans, x='Price', nbins=20,
                          title="Distribution of Plan Prices",
                          color_discrete_sequence=['#2196F3'])
        fig.update_layout(xaxis_title="Price ($)", yaxis_title="Number of Plans")
        st.plotly_chart(fig, use_container_width=True)

def show_ai_recommendations(rec_engine, users, user_profiles):
    """AI recommendations page"""
    st.subheader("🤖 Get AI-Powered Plan Recommendations")
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        # User selection
        user_options = [(row['User Id'], f"{row['Name']} (ID: {row['User Id']})") 
                       for _, row in users.iterrows()]
        selected_user_id = st.selectbox(
            "Select User:",
            options=[uid for uid, _ in user_options],
            format_func=lambda x: next(name for uid, name in user_options if uid == x)
        )
        
        if st.button("🎯 Suggest Best Plans", type="primary"):
            st.session_state.show_recs = True
            st.session_state.selected_user = selected_user_id
    
    with col2:
        if selected_user_id:
            # Show user profile
            user_info = users[users['User Id'] == selected_user_id].iloc[0]
            user_profile = user_profiles[user_profiles['User Id'] == selected_user_id].iloc[0]
            
            st.markdown("#### 📋 User Profile")
            st.markdown(f"""
            <div class="user-profile-card">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <strong>Name:</strong> {user_info['Name']}<br>
                        <strong>Status:</strong> {user_info['Status']}<br>
                        <strong>Total Subscriptions:</strong> {user_profile['total_subscriptions']}<br>
                        <strong>Active Subscriptions:</strong> {user_profile['active_subscriptions']}
                    </div>
                    <div>
                        <strong>Price Preference:</strong> ${user_profile['avg_price_preference']:.2f}<br>
                        <strong>Preferred Type:</strong> {user_profile['preferred_subscription_type']}<br>
                        <strong>Retention Rate:</strong> {user_profile['retention_rate']:.1%}<br>
                        <strong>Category:</strong> {user_profile['price_category']}
                    </div>
                </div>
            </div>
            """, unsafe_allow_html=True)
    
    # Show recommendations
    if st.session_state.get('show_recs', False):
        st.markdown("---")
        st.subheader("✨ AI-Recommended Plans")
        
        with st.spinner("🧠 AI is analyzing user behavior and generating personalized recommendations..."):
            recommendations = rec_engine.get_hybrid_recommendations(st.session_state.selected_user, top_n=5)
        
        if recommendations:
            for i, rec in enumerate(recommendations, 1):
                with st.container():
                    st.markdown(f"""
                    <div class="recommendation-card">
                        <h4>#{i} - {rec['plan_name']}</h4>
                        <p><strong>Price:</strong> ${rec['price']:.2f} | 
                           <strong>Auto Renewal:</strong> {rec['auto_renewal']} | 
                           <strong>AI Confidence:</strong> {rec['score']:.1%}</p>
                    </div>
                    """, unsafe_allow_html=True)
                    
                    # Show AI explanation
                    explanations = rec_engine.explain_recommendation(st.session_state.selected_user, rec['plan_id'])
                    st.markdown("**🤖 AI Explanation:**")
                    for exp in explanations:
                        st.write(f"• {exp}")
                    
                    if st.button(f"Select {rec['plan_name']}", key=f"select_{rec['plan_id']}"):
                        st.success(f"✅ {rec['plan_name']} selected! (Integration with subscription management)")
                    
                    st.divider()
        else:
            st.info("🔍 No specific recommendations available. Showing popular plans instead.")
            popular_plans = rec_engine.get_popular_plans(5)
            for i, plan in enumerate(popular_plans, 1):
                st.markdown(f"**#{i} - {plan['plan_name']}** - ${plan['price']:.2f}")

def show_analytics_insights(subscriptions, plans, user_profiles, billing):
    """Analytics and insights page"""
    st.subheader("📊 Analytics & Business Insights")
    
    tab1, tab2, tab3 = st.tabs(["📈 Subscription Trends", "💰 Revenue Analysis", "👥 User Behavior"])
    
    with tab1:
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("Subscription Types")
            type_counts = subscriptions['Subscription Type'].value_counts()
            fig = px.bar(x=type_counts.index, y=type_counts.values,
                        title="Monthly vs Yearly Subscriptions",
                        color_discrete_sequence=['#4CAF50'])
            st.plotly_chart(fig, use_container_width=True)
        
        with col2:
            st.subheader("Top 10 Popular Plans")
            plan_popularity = subscriptions['Product Id'].value_counts().head(10)
            plan_names = []
            for pid in plan_popularity.index:
                plan_name = plans[plans['Product Id'] == pid]['Name'].iloc[0]
                plan_names.append(plan_name)
            
            fig = px.bar(x=plan_names, y=plan_popularity.values,
                        title="Most Subscribed Plans",
                        color_discrete_sequence=['#2196F3'])
            fig.update_xaxes(tickangle=45)
            st.plotly_chart(fig, use_container_width=True)
    
    with tab2:
        # Revenue analysis
        subs_with_plans = subscriptions.merge(plans, on='Product Id')
        revenue_by_plan = subs_with_plans.groupby('Name')['Price'].sum().sort_values(ascending=False).head(10)
        
        fig = px.bar(x=revenue_by_plan.values, y=revenue_by_plan.index,
                    title="Revenue by Plan (Top 10)", orientation='h',
                    color_discrete_sequence=['#FF9800'])
        st.plotly_chart(fig, use_container_width=True)
        
        # Payment status
        col1, col2 = st.columns(2)
        with col1:
            billing_status = billing['payment_status'].value_counts()
            fig = px.pie(values=billing_status.values, names=billing_status.index,
                        title="Payment Status Distribution",
                        color_discrete_sequence=['#4CAF50', '#FF9800', '#F44336'])
            st.plotly_chart(fig, use_container_width=True)
        
        with col2:
            st.metric("Total Revenue", f"${billing['amount'].sum():,.2f}")
            st.metric("Average Bill", f"${billing['amount'].mean():.2f}")
            st.metric("Success Rate", f"{(billing['payment_status'] == 'paid').mean():.1%}")
    
    with tab3:
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("User Retention Rates")
            fig = px.histogram(user_profiles, x='retention_rate', nbins=10,
                             title="Distribution of User Retention Rates",
                             color_discrete_sequence=['#9C27B0'])
            st.plotly_chart(fig, use_container_width=True)
        
        with col2:
            st.subheader("Price Preferences")
            fig = px.histogram(user_profiles, x='avg_price_preference', nbins=15,
                             title="User Price Preferences",
                             color_discrete_sequence=['#FF5722'])
            st.plotly_chart(fig, use_container_width=True)

def show_plan_explorer(plans, subscriptions):
    """Plan explorer page"""
    st.subheader("🔍 Explore Available Plans")
    
    # Filters
    col1, col2, col3 = st.columns(3)
    
    with col1:
        price_range = st.slider("Price Range ($)",
                               float(plans['Price'].min()),
                               float(plans['Price'].max()),
                               (float(plans['Price'].min()), float(plans['Price'].max())))
    
    with col2:
        auto_renewal = st.selectbox("Auto Renewal", ["All", "Yes", "No"])
    
    with col3:
        sort_by = st.selectbox("Sort by", ["Price (Low to High)", "Price (High to Low)", "Popularity"])
    
    # Filter plans
    filtered_plans = plans[
        (plans['Price'] >= price_range[0]) &
        (plans['Price'] <= price_range[1])
    ]
    
    if auto_renewal != "All":
        filtered_plans = filtered_plans[filtered_plans['Auto Renewal Allowed'] == auto_renewal]
    
    # Add popularity
    plan_popularity = subscriptions['Product Id'].value_counts()
    filtered_plans = filtered_plans.copy()
    filtered_plans['Popularity'] = filtered_plans['Product Id'].map(plan_popularity).fillna(0)
    
    # Sort
    if sort_by == "Price (Low to High)":
        filtered_plans = filtered_plans.sort_values('Price')
    elif sort_by == "Price (High to Low)":
        filtered_plans = filtered_plans.sort_values('Price', ascending=False)
    else:
        filtered_plans = filtered_plans.sort_values('Popularity', ascending=False)
    
    # Display plans
    st.subheader(f"📋 Found {len(filtered_plans)} Plans")
    
    for _, plan in filtered_plans.iterrows():
        with st.container():
            st.markdown(f"""
            <div class="plan-card">
                <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 1rem; align-items: center;">
                    <div>
                        <h4>{plan['Name']}</h4>
                        <p>Plan ID: {plan['Product Id']}</p>
                    </div>
                    <div>
                        <strong>Price</strong><br>
                        <span style="font-size: 1.2em; color: #4CAF50;">${plan['Price']:.2f}</span>
                    </div>
                    <div>
                        <strong>Auto Renewal</strong><br>
                        {plan['Auto Renewal Allowed']}
                    </div>
                    <div>
                        <strong>Subscribers</strong><br>
                        {int(plan['Popularity'])}
                    </div>
                </div>
            </div>
            """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()
