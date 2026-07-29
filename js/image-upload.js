/* Processamento local de imagens para a fase frontend. */
const PPImagem = {
  tiposPermitidos: new Set(['image/jpeg', 'image/png', 'image/webp']),
  tamanhoMaximo: 5 * 1024 * 1024,

  async processarArquivo(arquivo, dimensaoMaxima = 900){
    if(!arquivo) throw new Error('Selecione uma imagem.');
    if(!this.tiposPermitidos.has(arquivo.type)){
      throw new Error('Use uma imagem JPG, PNG ou WebP.');
    }
    if(arquivo.size > this.tamanhoMaximo){
      throw new Error('A imagem deve ter no máximo 5 MB.');
    }

    const urlTemporaria = URL.createObjectURL(arquivo);
    try{
      const imagem = await new Promise((resolve, reject) => {
        const elemento = new Image();
        elemento.onload = () => resolve(elemento);
        elemento.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
        elemento.src = urlTemporaria;
      });
      const escala = Math.min(1, dimensaoMaxima / Math.max(imagem.naturalWidth, imagem.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(imagem.naturalWidth * escala));
      canvas.height = Math.max(1, Math.round(imagem.naturalHeight * escala));
      const contexto = canvas.getContext('2d');
      contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/webp', 0.75);
    } finally {
      URL.revokeObjectURL(urlTemporaria);
    }
  }
};
