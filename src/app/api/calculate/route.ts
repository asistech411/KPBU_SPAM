import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
    calculateFAHP,
    calculateLCM,
    calculatePAT,
    determineAllocation,
    determineGovernanceLocks,
    determineConfidence,
} from '@/lib/calculations'
import { RISKS } from '@/lib/constants'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Extract only fields that exist in the database schema
        const {
            id,
            consent,
            screening01,
            role,
            experience,
            phases,
            dualRole,
            projectType,
            projectLocation,
            projectPayment,
            projectStatus,
            projectPhase,
            fahpPairwise,
            lcmExposure,
            lcmPhaseCritical,
            pat1Data,
            pat2Data,
            respondentName,
            respondentEmail,
            additionalNotes,
            isSubmitted,
        } = body

        // Calculate results
        const fahp = calculateFAHP(fahpPairwise || {})
        const lcm = calculateLCM(lcmExposure || {}, lcmPhaseCritical || {})
        const pat = calculatePAT(pat1Data || {}, pat2Data || {})

        const allocations: Record<string, any> = {}
        const governanceLocks: Record<string, string[]> = {}
        const confidence: Record<string, any> = {}

        RISKS.forEach(r => {
            allocations[r.code] = determineAllocation(pat, r.code)
            governanceLocks[r.code] = determineGovernanceLocks(
                allocations[r.code],
                pat,
                r.code,
                dualRole ?? false
            )
            confidence[r.code] = determineConfidence(fahp, pat, r.code)
        })

        const results = {
            fahp,
            lcm,
            pat,
            allocations,
            governanceLocks,
            confidence,
            timestamp: new Date().toISOString(),
        }

        // Build data object with only valid fields
        const surveyData = {
            consent: consent ?? false,
            screening01: screening01 || null,
            role: role || null,
            experience: experience || null,
            phases: phases || [],
            dualRole: dualRole ?? false,
            projectType: projectType || null,
            projectLocation: projectLocation || null,
            projectPayment: projectPayment || null,
            projectStatus: projectStatus || null,
            projectPhase: projectPhase || null,
            fahpPairwise: fahpPairwise || {},
            lcmExposure: lcmExposure || {},
            lcmPhaseCritical: lcmPhaseCritical || {},
            pat1Data: pat1Data || {},
            pat2Data: pat2Data || {},
            results,
            respondentName: respondentName || null,
            respondentEmail: respondentEmail || null,
            additionalNotes: additionalNotes || null,
            isSubmitted: isSubmitted ?? true,
        }

        // Save or update survey with results
        let survey
        if (id) {
            survey = await prisma.survey.update({
                where: { id },
                data: surveyData,
            })
        } else {
            survey = await prisma.survey.create({
                data: surveyData,
            })
        }

        return NextResponse.json({
            surveyId: survey.id,
            results,
            message: 'Calculation completed and saved',
        })
    } catch (error) {
        console.error('Calculation error:', error)
        return NextResponse.json(
            { error: 'Failed to calculate results' },
            { status: 500 }
        )
    }
}
