import { ReactElement, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/layouts/ClientLayout'
import type { NextPageWithLayout } from '@/types/page'
import { Box } from '@mui/material'
import EventConfigurator from '@/features/clients/EventConfigurator'

const Configurator: NextPageWithLayout = () => {
    const router = useRouter()
    const [id, setId] = useState<number | null>(null)

    useEffect(() => {
        if (router.isReady) {
            const parsedId = parseInt(router.query.id as string, 10)
            if (isNaN(parsedId)) {
                router.push('/configurator/1')
            } else {
                setId(parsedId)
            }
        }
    }, [router.isReady, router.query.id])

    if (id === null) {
        return <Box pt={3} sx={{ height: '100vh' }}>
        </Box>
    }

    return (
        <EventConfigurator locationId={id} sx={{ height: '100%' }} />
    )
}

// Use ClientLayout as the layout for this page
Configurator.getLayout = function getLayout(page: ReactElement) {
    return <Layout>{page}</Layout>
}

export default Configurator