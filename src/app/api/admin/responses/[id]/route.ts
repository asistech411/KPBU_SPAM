import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.survey.delete({
            where: { id: params.id }
        })
        return NextResponse.json({ success: true })
    } catch (e) {
        console.error('Failed to delete survey:', e)
        return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 })
    }
}
