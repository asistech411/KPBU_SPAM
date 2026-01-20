import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

export async function GET() {
    const session = await getServerSession()

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const surveys = await prisma.survey.findMany({
            select: {
                id: true,
                respondentName: true,
                respondentEmail: true,
                role: true,
                isSubmitted: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        return NextResponse.json(surveys)
    } catch (error) {
        console.error('Error fetching surveys:', error)
        return NextResponse.json({ error: 'Failed to fetch surveys' }, { status: 500 })
    }
}
