import { NextResponse } from 'next/server'

interface Submission {
    id: string
    title: string
    titleSlug: string
    timestamp: string
    statusDisplay: string
    lang: string
}

interface ProblemInfo {
    difficulty: string
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const username = searchParams.get('username')
        if (!username) {
            return NextResponse.json({ error: 'username is required' }, { status: 400 })
        }

        // Query for recent submissions and user stats
        const submissionsQuery = `query recentSubmissionList($username: String!) {
            recentSubmissionList(username: $username) {
                id
                title
                titleSlug
                timestamp
                statusDisplay
                lang
            }
        }`

        const userStatsQuery = `query userProblemsSolved($username: String!) {
            matchedUser(username: $username) {
                submitStatsGlobal {
                    acSubmissionNum {
                        difficulty
                        count
                    }
                }
            }
        }`

        // Fetch both in parallel
        const [submissionsRes, statsRes] = await Promise.all([
            fetch('https://leetcode.com/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ query: submissionsQuery, variables: { username } }),
            }),
            fetch('https://leetcode.com/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ query: userStatsQuery, variables: { username } }),
            })
        ])

        if (!submissionsRes.ok) {
            return NextResponse.json({ error: 'Failed to fetch from LeetCode' }, { status: submissionsRes.status })
        }

        const data = await submissionsRes.json()
        const submissions: Submission[] = data?.data?.recentSubmissionList || []

        // Parse user stats
        let totalStats = { total: 0, easy: 0, medium: 0, hard: 0 }
        if (statsRes.ok) {
            const statsData = await statsRes.json()
            const acSubmissionNum = statsData?.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum || []
            for (const item of acSubmissionNum) {
                if (item.difficulty === 'All') totalStats.total = item.count
                else if (item.difficulty === 'Easy') totalStats.easy = item.count
                else if (item.difficulty === 'Medium') totalStats.medium = item.count
                else if (item.difficulty === 'Hard') totalStats.hard = item.count
            }
        }

        // Get unique problem slugs to fetch difficulty
        const uniqueSlugs = [...new Set(submissions.map(s => s.titleSlug))]

        // Fetch difficulty for each problem
        const difficultyMap: Record<string, string> = {}

        await Promise.all(
            uniqueSlugs.map(async (slug) => {
                try {
                    const problemQuery = `query questionData($titleSlug: String!) {
                        question(titleSlug: $titleSlug) {
                            difficulty
                        }
                    }`
                    const problemRes = await fetch('https://leetcode.com/graphql', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({ query: problemQuery, variables: { titleSlug: slug } }),
                    })
                    if (problemRes.ok) {
                        const problemData = await problemRes.json()
                        const difficulty = problemData?.data?.question?.difficulty
                        if (difficulty) {
                            difficultyMap[slug] = difficulty
                        }
                    }
                } catch {
                    // Ignore individual problem fetch errors
                }
            })
        )

        // Attach difficulty to each submission
        const enrichedSubmissions = submissions.map(s => ({
            ...s,
            difficulty: difficultyMap[s.titleSlug] || 'Unknown'
        }))

        return NextResponse.json({ submissions: enrichedSubmissions, totalStats })
    } catch (err) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
