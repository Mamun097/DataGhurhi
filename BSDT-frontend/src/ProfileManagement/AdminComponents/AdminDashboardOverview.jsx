import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";

const AdminDashboardOverview = ({ adminStats, getLabel }) => {
    const [userGrowthStats, setUserGrowthStats] = useState({
        current_month_users: 0,
        previous_month_users: 0,
        growth_rate: 0
    });

    const [surveyGrowthStats, setSurveyGrowthStats] = useState({
        current_month_surveys: 0,
        previous_month_surveys: 0,
        survey_growth_rate: 0
    });

    const [loading, setLoading] = useState(true);

    // Fetch user growth statistics
    useEffect(() => {
        const fetchUserGrowthStats = async () => {
            try {
                const response = await fetch('http://localhost:2000/api/admin/user-growth-stats');
                if (response.ok) {
                    const data = await response.json();
                    setUserGrowthStats({
                        current_month_users: data.userGrowthStats.current_month_users || 0,
                        previous_month_users: data.userGrowthStats.previous_month_users || 0,
                        growth_rate: data.userGrowthStats.growth_rate || 0
                    });
                } else {
                    console.error('Failed to fetch user growth stats');
                }
            } catch (error) {
                console.error('Error fetching user growth stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserGrowthStats();
    }, []);

    // Fetch user growth statistics
    useEffect(() => {
        const fetchSurveyGrowthStats = async () => {
            try {
                const response = await fetch('http://localhost:2000/api/admin/survey-growth-stats');
                if (response.ok) {
                    const data = await response.json();
                    setSurveyGrowthStats({
                        current_month_surveys: data.surveyGrowthStats.current_month_surveys || 0,
                        previous_month_surveys: data.surveyGrowthStats.previous_month_surveys || 0,
                        survey_growth_rate: data.surveyGrowthStats.growth_rate || 0
                    });
                } else {
                    console.error('Failed to fetch user growth stats');
                }
            } catch (error) {
                console.error('Error fetching user growth stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSurveyGrowthStats();
    }, []);

    const statCards = [
        {
            title: getLabel("Total Users"),
            value: adminStats.totalUsers,
            icon: "👥",
            color: "blue",
            //trend: "+12%"
        },
        {
            title: getLabel("Premium Users"),
            value: adminStats.premiumUsers,
            icon: "💎",
            color: "gold",
            //trend: "+15%"
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
                <p>{getLabel("Welcome to the administrative dashboard. Monitor your platform's performance and manage system settings.")}</p>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid">
                {statCards.map((stat, index) => (
                    <div key={index} className={`stat-card ${stat.color}`}>
                        <div className="stat-icon">{stat.icon}</div>
                        <div className="stat-content">
                            <h3>{stat.value.toLocaleString()}</h3>
                            <p>{stat.title}</p>
                            {/* <span className="stat-trend">{stat.trend}</span> */}
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
                {/* <div className="admin-card">
                <h3>{getLabel("Platform Health")}</h3>
                <div className="health-list">
                    {systemHealthItems.map((item, index) => (
                        <div key={index} className="health-item">
                            <span className="health-label">{item.label}</span>
                            <span className={`health-status ${item.color}`}>{item.status}</span>
                        </div>
                    ))}
                </div>
            </div> */}

                {/* Quick Analytics */}
                <div className="admin-card">
                    <h3>{getLabel("User Analytics")}</h3>
                    <div className="analytics-summary">
                        <div className="analytics-item">
                            <span className="analytics-label">{getLabel("New User at Current Month")}</span>
                            <span className="analytics-value">
                                {loading ? "Loading..." : userGrowthStats.current_month_users.toLocaleString()}
                            </span>
                        </div>
                        <div className="analytics-item">
                            <span className="analytics-label">{getLabel("New User at Previous Month")}</span>
                            <span className="analytics-value">
                                {loading ? "Loading..." : userGrowthStats.previous_month_users.toLocaleString()}
                            </span>
                        </div>

                        <div className="analytics-item">
                            <span className="analytics-label">{getLabel("User Growth Rate")}</span>
                            <span className="analytics-value">
                                {loading ? "Loading..." : `${userGrowthStats.growth_rate >= 0 ? '+' : ''}${userGrowthStats.growth_rate.toFixed(2)} per Day`}
                            </span>
                        </div>
                        {/* <div className="analytics-item">
                            <span className="analytics-label">{getLabel("System Performance")}</span>
                            <span className="analytics-value">Excellent</span>
                        </div> */}
                    </div>
                </div>

                {/* Quick Analytics */}
                <div className="admin-card">
                    <h3>{getLabel("Survey Analytics")}</h3>
                    <div className="analytics-summary">
                        <div className="analytics-item">
                            <span className="analytics-label">{getLabel("Survey Created at Current Month")}</span>
                            <span className="analytics-value">
                                {loading ? "Loading..." : surveyGrowthStats.current_month_surveys.toLocaleString()}
                            </span>
                        </div>
                        <div className="analytics-item">
                            <span className="analytics-label">{getLabel("Survey Created at Previous Month")}</span>
                            <span className="analytics-value">
                                {loading ? "Loading..." : surveyGrowthStats.previous_month_surveys.toLocaleString()}
                            </span>
                        </div>

                        <div className="analytics-item">
                            <span className="analytics-label">{getLabel("Survey Creation Growth Rate")}</span>
                            <span className="analytics-value">
                                {loading ? "Loading..." : `${surveyGrowthStats.survey_growth_rate >= 0 ? '+' : ''}${surveyGrowthStats.survey_growth_rate.toFixed(2)} per Day`}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Revenue Overview */}
                <div className="admin-card">
                    <h3>{getLabel("Revenue Overview")}</h3>
                    <div className="revenue-summary">
                        <div className="revenue-item">
                            <span className="revenue-amount">৳ 0.0</span>
                            <span className="revenue-label">{getLabel("This Month")}</span>
                        </div>
                        <div className="revenue-item">
                            <span className="revenue-amount">৳ 0.0</span>
                            <span className="revenue-label">{getLabel("Last Month")}</span>
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