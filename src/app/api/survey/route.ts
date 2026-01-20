import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Save/Update survey
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, ...data } = body

        if (id) {
            // Update existing survey
            const updated = await prisma.survey.update({
                where: { id },
                data: {
                    consent: data.consent ?? false,
                    role: data.role || null,
                    experience: data.experience || null,
                    phases: data.phases || [],
                    dualRole: data.dualRole ?? false,
                    projectType: data.projectType || null,
                    projectLocation: data.projectLocation || null,
                    projectPayment: data.projectPayment || null,
                    projectStatus: data.projectStatus || null,
                    projectPhase: data.projectPhase || null,
                    fahpPairwise: data.fahpPairwise || {},
                    lcmExposure: data.lcmExposure || {},
                    lcmPhaseCritical: data.lcmPhaseCritical || {},
                    pat1Data: data.pat1Data || {},
                    pat2Data: data.pat2Data || {},
                    additionalNotes: data.additionalNotes || null,
                    respondentName: data.respondentName || null,
                    respondentEmail: data.respondentEmail || null,
                },
            })
            return NextResponse.json({ id: updated.id, message: 'Survey updated' })
        } else {
            // Create new survey
            const created = await prisma.survey.create({
                data: {
                    consent: data.consent ?? false,
                    role: data.role || null,
                    experience: data.experience || null,
                    phases: data.phases || [],
                    dualRole: data.dualRole ?? false,
                    projectType: data.projectType || null,
                    projectLocation: data.projectLocation || null,
                    projectPayment: data.projectPayment || null,
                    projectStatus: data.projectStatus || null,
                    projectPhase: data.projectPhase || null,
                    fahpPairwise: data.fahpPairwise || {},
                    lcmExposure: data.lcmExposure || {},
                    lcmPhaseCritical: data.lcmPhaseCritical || {},
                    pat1Data: data.pat1Data || {},
                    pat2Data: data.pat2Data || {},
                    additionalNotes: data.additionalNotes || null,
                    respondentName: data.respondentName || null,
                    respondentEmail: data.respondentEmail || null,
                },
            })
            return NextResponse.json({ id: created.id, message: 'Survey created' })
        }
    } catch (error) {
        console.error('Survey save error:', error)
        return NextResponse.json({ error: 'Failed to save survey' }, { status: 500 })
    }
}

// Get survey by ID
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Missing survey ID' }, { status: 400 })
        }

        const survey = await prisma.survey.findUnique({
            where: { id },
        })

        if (!survey) {
            return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
        }

        return NextResponse.json(survey)
    } catch (error) {
        console.error('Survey fetch error:', error)
        return NextResponse.json({ error: 'Failed to fetch survey' }, { status: 500 })
    }
}
