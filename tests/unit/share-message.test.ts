import { describe, expect, it } from 'vitest'
import { buildServiceShareText, buildSongListShareText, type Service } from '../../app/composables/useService'

const service: Service = {
  id: 'service-id',
  date: '2026-11-15',
  type: 'noite',
  frequency: { adults: 10, visitors: 2, children: 3, visitingChildren: 1 },
  songs: [],
  participants: {
    worship: [{ id: '1', name: 'Ana' }],
    word: [{ id: '2', name: 'Bruno' }],
    gate: [{ id: '3', name: 'Carlos' }]
  }
}

describe('mensagem de compartilhamento', () => {
  it('usa a igreja, total em negrito e responsáveis em linhas separadas', () => {
    const message = buildServiceShareText(service, 'Igreja Central')

    expect(message).toContain('*Igreja Central — Registro de culto*')
    expect(message).toContain('*Total de presentes: 16*')
    expect(message).toContain('*Responsáveis*')
    expect(message).toContain('Louvor: Ana')
    expect(message).toContain('Palavra: Bruno')
    expect(message).toContain('Portão: Carlos')
    expect(message).not.toContain('Flow Services')
  })

  it('gera uma mensagem somente com a lista de louvores e identifica avulsos', () => {
    const message = buildSongListShareText({
      ...service,
      songs: [
        { id: 'song-1', number: 40, isLoose: false, name: 'Louvor numerado' },
        { id: 'song-2', number: null, isLoose: true, name: 'Louvor avulso' }
      ]
    }, 'Igreja Central')

    expect(message).toContain('*Igreja Central — Registro de culto*')
    expect(message).toContain('*Data:* 15/11/2026')
    expect(message).toContain('*Tipo:* Culto à Noite')
    expect(message).toContain('Lista de Louvores')
    expect(message).toContain('40:Louvor numerado')
    expect(message).toContain('Avulso:Louvor avulso')
    expect(message).not.toContain('Frequência')
    expect(message).not.toContain('Responsáveis')
  })
})
