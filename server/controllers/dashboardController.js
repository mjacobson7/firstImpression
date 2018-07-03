const { raw } = require('objection');
const Survey = require('../models/schema').Survey;
const User = require('../models/schema').User

module.exports = {

    getUserWidgetData: async (req, res) => {
        try {
            const widgetInfo = await Survey
                .query()
                .eager('user')
                .avg('rating as score')
                .count('rating')
                .where('surveys.companyId', req.principal.companyId)
                .groupBy('surveys.userId')

            // Sort company-wide average scores from highest to lowest
            widgetInfo.sort((a, b) => b.score - a.score);

            // Find where user ranks in company
            let companyRank = widgetInfo.findIndex(x => x.user.id === req.principal.id) + 1;

            // Filter users in team (if current user is part of a team)
            let teamRank = null;
            if (req.principal.supervisorId) {
                let team = widgetInfo.filter(x => x.user.supervisorId === req.principal.supervisorId);
                // Find where user ranks on team
                teamRank = team.findIndex(x => x.user.id === req.principal.id) + 1;
            }

            // Get current user average score and # of surveys
            let user = widgetInfo.filter(x => x.user.id === req.principal.id);

            res.status(200).json({ user, teamRank, companyRank });
        }
        catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    },

    getTeamLeaderboard: async (req, res) => {
        try {
            let { pageSize, length, pageNumber, orderBy, orderDir, searchText } = req.body.params;

            if (searchText !== "") {
                length = null,
                    pageNumber = 1
            }

            let offset = (pageNumber - 1) * pageSize;
            searchText = '%' + searchText.toLowerCase() + '%';

            let { pageIndex } = req.body.params;
            let teamRankings = [];
            let count;

            if (req.principal.supervisorId) {
                count = await User
                    .query()
                    .count()
                    .where('companyId', req.principal.companyId)
                    .andWhere('supervisorId', req.principal.supervisorId)
            } else {
                const leaderboard = {
                    rankings: teamRankings,
                    length: 0
                }

                res.status(200).json(leaderboard);

            }

            teamRankings = await User
                .query()
                .select(raw('dense_rank() OVER (ORDER BY AVG(surveys.rating) desc NULLS LAST) rank, ' +
                    'round(AVG(surveys.rating), 2) as "averageScore", users.*'))
                .joinRaw('left join surveys ON surveys."userId" = users.id')
                .where(raw('users."companyId" = ??', req.principal.companyId))
                .andWhere(raw('users."supervisorId" = ??', req.principal.supervisorId))
                .groupByRaw('users.id')
                .limit(pageSize)
                .offset(offset)

            for (let userRank of teamRankings) {
                if (!userRank.averageScore) {
                    userRank.averageScore = '-';
                }
            }

            const leaderboard = {
                rankings: teamRankings,
                length: count[0].count
            }

            res.status(200).json(leaderboard);
        }
        catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    },

    getSurveyChartData: async (req, res) => {
        try {
            let sort = req.body.sort;
            let data = [];
            let labels = [];
            let days;

            if (sort === '1M') days = 30;
            else if (sort === '3M') days = 90;
            else if (sort === '6M') days = 180;
            else if (sort === '1Y') days = 365;
            else if (sort === '5Y') days = 1825;
            else { /*throw error */ }


            let endDate = new Date();
            endDate.setHours(23, 59, 59, 999);
            let startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            startDate.setHours(0, 0, 0, 0);

            const surveys = await Survey
                .query()
                .select('rating', 'createdAt')
                .where('userId', req.principal.id)
                .andWhere('companyId', req.principal.companyId)
                .whereBetween('createdAt', [startDate, endDate])
                .orderBy('createdAt', 'ASC')

            // let surveys = await Survey.findAll({
            //     where: {
            //         userId: req.principal.id,
            //         companyId: req.principal.companyId,
            //         createdAt: { between: [startDate, endDate] }
            //     },
            //     attributes: ['rating', 'createdAt'],
            //     order: [['createdAt', 'ASC']]

            // })

            for (let survey of surveys) {
                data.push(survey.rating);
                let date = new Date(survey.createdAt);
                let month = date.getMonth() + 1;
                let day = date.getDate();
                let year = date.getFullYear();
                let newdate = month + "/" + day + "/" + year;
                labels.push(newdate);
            }

            res.status(200).json({ labels: labels, data: [{ data: data }] });
        }
        catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    }


} //end controller