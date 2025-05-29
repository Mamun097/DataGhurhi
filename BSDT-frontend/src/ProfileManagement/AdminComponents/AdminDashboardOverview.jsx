import React from "react";
import "./AdminDashboard.css";

const AdminDashboardOverview = ({ adminStats, getLabel }) => {
  const statCards = [
    {
      title: getLabel("Total Users"),
      value: adminStats.totalUsers,
      icon: "👥",
      color: "blue",
      //trend: "+12%"
    },
    {
      title: getLabel("Active Surveys"),
      value: adminStats.activeSurveys,
      icon: "📊",
      color: "green",
      //trend: "+8%"
    },
    {
      title: getLabel("Total Responses"),
      value: adminStats.totalResponses,
      icon: "📝",
      color: "purple",
      //trend: "+25%"
    },
    {
      title: getLabel("Premium Users"),
      value: adminStats.premiumUsers,
      icon: "💎",
      color: "gold",
      //trend: "+15%"
    }
  ];

  const systemHealthItems = [
    { label: getLabel("Database Status"), status: "Healthy", color: "green" },
    { label: getLabel("Server Status"), status: "Running", color: "green" },
    { label: getLabel("API Status"), status: "Active", color: "green" },
    { label: getLabel("Active Sessions"), status: "Normal", color: "green" }
  ];

return (
    <div className="admin-dashboard-overview">
        <div className="admin-header">
            <h2>{getLabel("System Overview")}</h2>
            <p>Welcome to the administrative dashboard. Monitor your platform's performance and manage system settings.</p>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
            {statCards.map((stat, index) => (
                <div key={index} className={`stat-card ${stat.color}`}>
                    <div className="stat-icon">{stat.icon}</div>
                    <div className="stat-content">
                        <h3>{stat.value.toLocaleString()}</h3>
                        <p>{stat.title}</p>
                        <span className="stat-trend">{stat.trend}</span>
                    </div>
                </div>
            ))}
        </div>

        {/* Dashboard Content Grid */}
        <div className="admin-content-grid">
            {/* Recent Activities */}
            {/* <div className="admin-card">
                <h3>{getLabel("Recent Activities")}</h3>
                <div className="activities-list">
                    {adminStats.recentActivities.map((activity) => (
                        <div key={activity.id} className="activity-item">
                            <div className="activity-content">
                                <span className="activity-text">{activity.activity}</span>
                                <span className="activity-time">{activity.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div> */}

            {/* System Health */}
            <div className="admin-card">
                <h3>{getLabel("Platform Health")}</h3>
                <div className="health-list">
                    {systemHealthItems.map((item, index) => (
                        <div key={index} className="health-item">
                            <span className="health-label">{item.label}</span>
                            <span className={`health-status ${item.color}`}>{item.status}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Analytics */}
            <div className="admin-card">
                <h3>{getLabel("Survey Analytics")}</h3>
                <div className="analytics-summary">
                    <div className="analytics-item">
                        <span className="analytics-label">{getLabel("User Growth")}</span>
                        <span className="analytics-value">+12.5%</span>
                    </div>
                    <div className="analytics-item">
                        <span className="analytics-label">{getLabel("Survey Creation Rate")}</span>
                        <span className="analytics-value">4.2/day</span>
                    </div>
                    <div className="analytics-item">
                        <span className="analytics-label">{getLabel("Response Collection Rate")}</span>
                        <span className="analytics-value">89.3%</span>
                    </div>
                    <div className="analytics-item">
                        <span className="analytics-label">{getLabel("System Performance")}</span>
                        <span className="analytics-value">Excellent</span>
                    </div>
                </div>
            </div>

            {/* Revenue Overview */}
            <div className="admin-card">
                <h3>{getLabel("Revenue Overview")}</h3>
                <div className="revenue-summary">
                    <div className="revenue-item">
                        <span className="revenue-amount">৳ 0.0</span>
                        <span className="revenue-label">This Month</span>
                    </div>
                    <div className="revenue-item">
                        <span className="revenue-amount">৳ 0.0</span>
                        <span className="revenue-label">Last Month</span>
                    </div>
                    <div className="revenue-trend">
                        <span className="trend-positive">0% growth</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
};

export default AdminDashboardOverview;