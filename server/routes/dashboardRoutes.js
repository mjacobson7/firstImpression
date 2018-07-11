const dashboardController = require('../controllers/dashboardController');
const authController = require('../controllers/authController');

module.exports = (app) => {
    app.get('/getAdminWidgets', authController.verifyValidToken, authController.hasPermission('CAN_ADMIN'), dashboardController.getAdminWidgets);
    app.get('/getSupervisorWidgets', authController.verifyValidToken, authController.hasPermission('CAN_SUPERVISE'), dashboardController.getSupervisorWidgets);
    app.get('/getAgentWidgets', authController.verifyValidToken, dashboardController.getAgentWidgets);

    app.post('/team_leaderboard', authController.verifyValidToken, dashboardController.getTeamLeaderboard);
    app.post('/survey_chart_data', authController.verifyValidToken, dashboardController.getSurveyChartData);
}