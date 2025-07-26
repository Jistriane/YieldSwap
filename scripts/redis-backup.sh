/*
 * 🔐 ARQUIVO ASSINADO DIGITALMENTE
 * 
 * ✍️ Assinado por: Jistriane Brunielli Silva de Oliveira
 * 📅 Validade: 10 anos (até 2035)
 * 🔒 Método: RSA-4096 + SHA-512
 * 📜 Verificação: SIGNATURE.md
 * ⚠️  MODIFICAÇÕES NÃO AUTORIZADAS INVALIDARÃO A ASSINATURA
 */


#!/bin/bash

# Configurações
BACKUP_DIR="/var/backups/redis"
RETENTION_DAYS=7
REDIS_CONTAINER="yieldswap-redis"
S3_BUCKET="s3://yieldswap-backups/redis"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="redis_backup_${TIMESTAMP}.rdb"

# Criar diretório de backup se não existir
mkdir -p ${BACKUP_DIR}

# Função para log
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Função para enviar notificação via Slack
notify_slack() {
  if [ ! -z "${SLACK_WEBHOOK_URL}" ]; then
    curl -X POST -H 'Content-type: application/json' \
      --data "{\"text\":\"$1\"}" \
      ${SLACK_WEBHOOK_URL}
  fi
}

# Função para limpar backups antigos
cleanup_old_backups() {
  log "Limpando backups mais antigos que ${RETENTION_DAYS} dias"
  find ${BACKUP_DIR} -type f -name "redis_backup_*.rdb" -mtime +${RETENTION_DAYS} -delete
  aws s3 ls ${S3_BUCKET}/ | grep "redis_backup_" | while read -r line; do
    timestamp=$(echo $line | awk '{print $4}' | sed 's/redis_backup_\([0-9]\{8\}\).*/\1/')
    if [ $(( ($(date +%s) - $(date -d "${timestamp}" +%s)) / 86400 )) -gt ${RETENTION_DAYS} ]; then
      aws s3 rm "${S3_BUCKET}/${line##* }"
    fi
  done
}

# Função para verificar integridade do backup
verify_backup() {
  local backup_file=$1
  if redis-check-rdb ${backup_file}; then
    log "Verificação do backup concluída com sucesso"
    return 0
  else
    log "ERRO: Backup corrompido"
    notify_slack "⚠️ ALERTA: Backup do Redis corrompido - ${backup_file}"
    return 1
  fi
}

# Iniciar backup
log "Iniciando backup do Redis"
notify_slack "🔄 Iniciando backup do Redis"

# Executar backup via redis-cli
if docker exec ${REDIS_CONTAINER} redis-cli SAVE; then
  # Copiar arquivo RDB do container
  docker cp ${REDIS_CONTAINER}:/data/dump.rdb ${BACKUP_DIR}/${BACKUP_FILE}
  
  # Verificar integridade
  if verify_backup ${BACKUP_DIR}/${BACKUP_FILE}; then
    # Comprimir backup
    gzip ${BACKUP_DIR}/${BACKUP_FILE}
    
    # Enviar para S3
    if aws s3 cp ${BACKUP_DIR}/${BACKUP_FILE}.gz ${S3_BUCKET}/${BACKUP_FILE}.gz; then
      log "Backup enviado para S3 com sucesso"
      notify_slack "✅ Backup do Redis concluído e enviado para S3"
      
      # Limpar backups antigos
      cleanup_old_backups
    else
      log "ERRO: Falha ao enviar backup para S3"
      notify_slack "❌ ERRO: Falha ao enviar backup do Redis para S3"
    fi
  fi
else
  log "ERRO: Falha ao executar backup do Redis"
  notify_slack "❌ ERRO: Falha ao executar backup do Redis"
  exit 1
fi

# Remover arquivo local após envio para S3
rm -f ${BACKUP_DIR}/${BACKUP_FILE}*

log "Processo de backup concluído" 