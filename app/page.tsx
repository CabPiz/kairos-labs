import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground p-8 flex flex-col gap-4">
      <h1 className="text-4xl font-bold text-primary">Kairos Labs</h1>
      <Badge variant="outline">INPI Nº 944610498</Badge>
      <Card className="w-64">
        <CardHeader><CardTitle>DevPrint</CardTitle></CardHeader>
        <CardContent>
          <Button>Garantir Acesso Antecipado</Button>
        </CardContent>
      </Card>
    </main>
  )
}