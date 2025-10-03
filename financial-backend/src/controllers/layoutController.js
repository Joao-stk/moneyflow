/**
 * Controller para salvar layout do dashboard
 */
const saveLayout = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { layouts } = req.body;

    console.log('Salvando layout para usuário:', userId); // DEBUG
    console.log('Layouts recebidos:', layouts); // DEBUG

    // Validar dados
    if (!layouts || typeof layouts !== 'object') {
      return res.status(400).json({ error: 'Layouts são obrigatórios' });
    }

    // Salvar cada tamanho de tela
    for (const [screenSize, layout] of Object.entries(layouts)) {
      console.log(`Salvando layout para ${screenSize}:`, layout); // DEBUG
      
      await req.prisma.dashboardLayout.upsert({
        where: {
          userId_screenSize: {
            userId,
            screenSize
          }
        },
        update: {
          layout: JSON.stringify(layout)
        },
        create: {
          layout: JSON.stringify(layout),
          screenSize,
          userId
        }
      });
    }

    res.json({ message: 'Layout salvo com sucesso' });
  } catch (error) {
    console.error('Erro ao salvar layout:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao salvar layout' });
  }
};

/**
 * Controller para carregar layout do dashboard
 */
const getLayout = async (req, res) => {
  try {
    const userId = req.user.userId;

    console.log('Carregando layout para usuário:', userId); // DEBUG

    const layouts = await req.prisma.dashboardLayout.findMany({
      where: { userId },
      select: {
        screenSize: true,
        layout: true
      }
    });

    console.log('Layouts encontrados:', layouts); // DEBUG

    // Converter para o formato esperado pelo react-grid-layout
    const formattedLayouts = {};
    layouts.forEach(item => {
      try {
        formattedLayouts[item.screenSize] = JSON.parse(item.layout);
      } catch (parseError) {
        console.error('Erro ao parsear layout:', parseError);
        formattedLayouts[item.screenSize] = [];
      }
    });

    res.json({ layouts: formattedLayouts });
  } catch (error) {
    console.error('Erro ao carregar layout:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao carregar layout' });
  }
};

module.exports = { saveLayout, getLayout };