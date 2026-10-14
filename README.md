# Geometry Infinity

<p align="center">
  <a href="https://asafegamer05-glitch.github.io/Geometry-Infinity/">
    <img src="https://img.shields.io/badge/PLAY-GEOMETRY_INFINITY-e94560?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Jogar Geometry Infinity">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/feito%20com-HTML%2C%20CSS%20e%20JavaScript-f06529?style=flat-square" alt="Feito com HTML, CSS e JavaScript">
  <img src="https://img.shields.io/badge/projeto-single--player-27ae60?style=flat-square" alt="Projeto single-player">
  <img src="https://img.shields.io/badge/estilo-fan--made-282828?style=flat-square" alt="Projeto de fã">
</p>

**Geometry Infinity** e um tracker de progresso single-player inspirado nas listas de dificuldade de Geometry Dash. Monte sua temporada, jogue os niveis no seu proprio Geometry Dash e volte ao site para registrar seus records, completions e verificacoes.

> Geometry Infinity nao e um cliente de Geometry Dash e nao joga os niveis por voce. A ideia e acompanhar uma jornada ficticia de top player, por diversao.

## Visao geral

- Temporada com 30 turnos e progressao de niveis ao longo do tempo.
- Registro manual de melhor porcentagem, tentativas e conclusoes.
- Pontos por progresso, completions e tentativas baixas.
- NPCs simulados que competem na classificacao e avancam a cada turno.
- Desafios extras sempre disponiveis.
- Opcao de verificar antecipadamente um nivel que ainda nao entrou na lista.
- Ranking, perfis, eventos de turno e resumo final da temporada.
- Salvamento local no navegador, sem conta ou servidor de jogo.

## Imagens dos niveis

As miniaturas abaixo sao os arquivos de imagem usados pelo projeto. No jogo, elas aparecem nos cards dos niveis.

<table>
  <tr>
    <td align="center"><img src="assets/levels/stereo_madness.jpg" alt="Miniatura de Stereo Madness" width="240"><br><strong>Stereo Madness</strong></td>
    <td align="center"><img src="assets/levels/back_on_track.jpg" alt="Miniatura de Back on Track" width="240"><br><strong>Back on Track</strong></td>
    <td align="center"><img src="assets/levels/polargeist.jpg" alt="Miniatura de Polargeist" width="240"><br><strong>Polargeist</strong></td>
  </tr>
  <tr>
    <td align="center"><img src="assets/levels/dry_out.jpg" alt="Miniatura de Dry Out" width="240"><br><strong>Dry Out</strong></td>
    <td align="center"><img src="assets/levels/base_after_base.jpg" alt="Miniatura de Base After Base" width="240"><br><strong>Base After Base</strong></td>
    <td align="center"><img src="assets/levels/cant_let_go.jpg" alt="Miniatura de Can't Let Go" width="240"><br><strong>Can't Let Go</strong></td>
  </tr>
</table>

## Como jogar

1. Abra o [Geometry Infinity](https://asafegamer05-glitch.github.io/Geometry-Infinity/).
2. Digite seu nome de jogador e inicie uma temporada.
3. Abra Geometry Dash fora do site e jogue os niveis que estiverem disponiveis.
4. Volte ao tracker e use **Log Progress** para anotar seu melhor percentual e o total de tentativas. Marque a caixa de conclusao quando vencer o nivel.
5. Ao terminar sua sessao, avance o turno para atualizar o calendario, os NPCs e os eventos.
6. Consulte o ranking, os perfis e a aba **Season** para acompanhar a temporada.

Os registros sao manuais e feitos para uma experiencia casual. O limite de 10 tentativas por nivel em cada turno e uma regra combinada para a brincadeira; o site nao verifica nem bloqueia as tentativas feitas dentro do Geometry Dash.

## Niveis e temporada

| Nivel | Desbloqueia no turno | Pontos base |
|---|---:|---:|
| Stereo Madness | 1 | 50 |
| Back on Track | 5 | 110 |
| Polargeist | 9 | 200 |
| Dry Out | 13 | 320 |
| Base After Base | 17 | 470 |
| Can't Let Go | 21 | 660 |
| Jumper | 25 | 900 |

Os niveis aparecem na lista do mais dificil para o mais facil. No turno 27, a simulacao faz um evento especial e coloca **Can't Let Go** acima de **Jumper** na lista.

### Pontuacao

- Ao alcancar **51% ou mais**, recebe metade dos pontos base do nivel.
- Ao completar o nivel, recebe os pontos base completos e um bonus baseado no total de tentativas registrado.
- O bonus de tentativas e maior para conclusoes com menos tentativas: abaixo de 100, abaixo de 300 e abaixo de 1.000 tentativas ha faixas de bonus diferentes.
- Desafios concedem pontos extras; completar com poucas tentativas tambem pode render bonus.
- O ranking ordena os participantes pela pontuacao e usa niveis concluidos como desempate.

## Os NPCs

O ranking inclui 20 jogadores simulados. Cada NPC tem um nivel de habilidade que influencia o progresso, a chance de concluir niveis e a chance de completar desafios. Os resultados sao gerados pelo proprio jogo e podem variar de uma temporada para outra.

Os nomes sao personagens de simulacao usados para dar contexto ao ranking; o projeto nao consulta resultados oficiais nem se conecta a Geometry Dash.

## Tecnologias

- **HTML** para as paginas e modais.
- **CSS** para o layout responsivo e os componentes visuais.
- **JavaScript** sem framework para regras, simulacao, ranking e persistencia.
- **LocalStorage** para guardar o progresso neste navegador.

Nao ha etapa de build nem dependencias npm.

## Executar localmente

Clone ou baixe o repositorio e abra `index.html` em um navegador. Para uma experiencia mais consistente, especialmente ao carregar `level_ids.txt`, rode os arquivos por uma extensao de servidor local, como Live Server no VS Code.

```text
geometryInfinity/
|-- index.html
|-- game.html
|-- game.js
|-- style.css
|-- level_ids.txt
`-- assets/
    `-- levels/
```

## Personalizar

- **Niveis, pontos, turnos, NPCs e desafios:** edite as constantes no inicio de `game.js`.
- **IDs dos niveis:** preencha `level_ids.txt` no formato `Nome do Nivel: ID`. Os IDs tambem podem ser definidos em `GI.LEVEL_IDS`.
- **Miniaturas:** coloque imagens em `assets/levels/` com o identificador do nivel como nome, por exemplo `stereo_madness.jpg`. O projeto aceita `.png`, `.jpg` e `.jpeg`.
- **Visual:** altere as variaveis e regras em `style.css`.

Mais detalhes sobre as miniaturas estao em [`assets/levels/README.md`](assets/levels/README.md).

## Salvamento e privacidade

O progresso fica no `localStorage` do navegador, na chave `geometry_infinity_save`. Isso significa que ele nao sincroniza entre navegadores ou dispositivos e pode ser perdido ao limpar os dados do site. Use **Reset Progress** para apagar a temporada atual; iniciar uma nova temporada tambem substitui o progresso salvo.

O projeto nao precisa de cadastro, nao envia os registros para um servidor e nao valida o que acontece dentro do Geometry Dash.

## GitHub Pages

O botao **PLAY** no inicio deste README abre a URL publica planejada para o GitHub Pages deste repositorio:

<p align="center">
  <a href="https://asafegamer05-glitch.github.io/Geometry-Infinity/">
    <img src="https://img.shields.io/badge/ABRIR%20O%20JOGO-CLIQUE%20AQUI-e94560?style=for-the-badge" alt="Abrir Geometry Infinity no GitHub Pages">
  </a>
</p>

Para publicar pelo GitHub, ative **Settings > Pages** e configure a origem para a branch principal e a pasta raiz (`/`). A pagina pode levar alguns minutos para ficar disponivel apos a publicacao.

## Aviso

Geometry Infinity e um projeto de fã, sem afiliacao com RobTop Games ou com os criadores de Geometry Dash. Geometry Dash e suas marcas pertencem aos respectivos titulares. As imagens presentes no projeto sao miniaturas de niveis usadas como elementos visuais do tracker.

---

Feito para acompanhar uma temporada, registrar records e se divertir.