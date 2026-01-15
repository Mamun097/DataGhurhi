# Supabase Database Backup & Recovery Guide

Complete guide for backing up and restoring your Supabase PostgreSQL database.

---

## Table of Contents
1. [Method 1: Docker (Recommended)](#method-1-docker-recommended)
2. [Method 2: PostgreSQL Client Tools](#method-2-postgresql-client-tools)
3. [Method 3: Supabase CLI](#method-3-supabase-cli)
4. [Automated Backup Scheduling](#automated-backup-scheduling)
5. [Best Practices](#best-practices)

---

## Method 1: Docker (Recommended)

### Why Docker?
- No need to install or upgrade PostgreSQL tools
- Always uses the correct PostgreSQL version
- Works on any system with Docker installed
- Clean and isolated from your system

### Prerequisites
- Docker installed on your system
- Your Supabase connection string
- Your database password

### Getting Your Connection Details

1. Go to your Supabase project dashboard
2. Click the **"Connect"** button at the top
3. Navigate to the **"ORMs"** tab
4. Copy the `DIRECT_URL` connection string
5. Get your database password from **Settings → Database**

Your connection string format:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres
```

**Important:** If your password contains special characters, URL-encode them:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`

Example: Password `bsdtDB@2025` becomes `bsdtDB%402025`

### Creating a Backup

**Basic backup:**
```bash
sudo docker run --rm postgres:15 pg_dump "postgresql://postgres.[PROJECT-REF]:[ENCODED-PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres" > backup.sql
```

**Backup with timestamp:**
```bash
sudo docker run --rm postgres:15 pg_dump "postgresql://postgres.[PROJECT-REF]:[ENCODED-PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres" > backup-$(date +%Y%m%d-%H%M%S).sql
```

**Example with actual connection:**
```bash
sudo docker run --rm postgres:15 pg_dump "postgresql://postgres.hearrmxusukxrwmuvkac:bsdtDB%402025@aws-0-ap-south-1.pooler.supabase.com:5432/postgres" > backup-$(date +%Y%m%d).sql
```

### Compressed Backup (Saves Space)

```bash
sudo docker run --rm postgres:15 pg_dump "postgresql://postgres.[PROJECT-REF]:[ENCODED-PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres" | gzip > backup-$(date +%Y%m%d).sql.gz
```

### Restoring from Backup

**Restore from regular backup:**
```bash
sudo docker run --rm -i postgres:15 psql "postgresql://postgres.[PROJECT-REF]:[ENCODED-PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres" < backup.sql
```

**Restore from compressed backup:**
```bash
gunzip -c backup-20260111.sql.gz | sudo docker run --rm -i postgres:15 psql "postgresql://postgres.[PROJECT-REF]:[ENCODED-PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

### Docker Permission Setup (Optional)

If you don't want to use `sudo` every time:

```bash
# Add your user to docker group
sudo usermod -aG docker $USER

# Reload group membership
newgrp docker

# Log out and log back in for permanent effect

# Now you can run without sudo
docker run --rm postgres:15 pg_dump "postgresql://..." > backup.sql
```

---

## Method 2: PostgreSQL Client Tools

### Prerequisites
- PostgreSQL client version 15 or higher installed

### Installing PostgreSQL Client

**Ubuntu/Debian:**
```bash
# Add PostgreSQL repository
wget -qO- https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo tee /etc/apt/trusted.gpg.d/pgdg.asc

echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" | sudo tee /etc/apt/sources.list.d/pgdg.list

# Update and install
sudo apt update
sudo apt install postgresql-client-15
```

**macOS:**
```bash
brew install postgresql@15
```

**Verify installation:**
```bash
pg_dump --version
```

### Creating a Backup

```bash
pg_dump "postgresql://postgres.[PROJECT-REF]:[ENCODED-PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres" > backup-$(date +%Y%m%d).sql
```

### Restoring from Backup

```bash
psql "postgresql://postgres.[PROJECT-REF]:[ENCODED-PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres" < backup.sql
```

---

## Method 3: Supabase CLI

### Prerequisites
- Node.js version 14 or higher
- npm version 8 or higher

### Installing Supabase CLI

```bash
npm install -g supabase
```

### Creating a Backup

**Full backup (recommended):**
```bash
supabase db dump --db-url "postgresql://postgres.[PROJECT-REF]:[ENCODED-PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres" -f backup.sql
```

**Separate backups (more control):**
```bash
# Backup roles
supabase db dump --db-url "postgresql://..." -f roles.sql --role-only

# Backup schema
supabase db dump --db-url "postgresql://..." -f schema.sql --schema-only

# Backup data
supabase db dump --db-url "postgresql://..." -f data.sql --use-copy --data-only
```

### Restoring from Backup

**Full restore:**
```bash
supabase db execute --db-url "postgresql://..." -f backup.sql
```

**Restore in order (if using separate files):**
```bash
supabase db execute --db-url "postgresql://..." -f roles.sql
supabase db execute --db-url "postgresql://..." -f schema.sql
supabase db execute --db-url "postgresql://..." -f data.sql
```

---

## Automated Backup Scheduling

### Using Cron (Linux/macOS)

1. Create a backup script:

```bash
nano ~/supabase-backup.sh
```

2. Add this content:

```bash
#!/bin/bash

# Configuration
PROJECT_REF="hearrmxusukxrwmuvkac"
PASSWORD="bsdtDB%402025"
REGION="ap-south-1"
BACKUP_DIR="$HOME/supabase-backups"
DATE=$(date +%Y%m%d-%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Create backup
sudo docker run --rm postgres:15 pg_dump \
  "postgresql://postgres.$PROJECT_REF:$PASSWORD@aws-0-$REGION.pooler.supabase.com:5432/postgres" \
  | gzip > "$BACKUP_DIR/backup-$DATE.sql.gz"

# Delete old backups
find "$BACKUP_DIR" -name "backup-*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: backup-$DATE.sql.gz"
```

3. Make it executable:

```bash
chmod +x ~/supabase-backup.sh
```

4. Test it:

```bash
~/supabase-backup.sh
```

5. Schedule with cron:

```bash
crontab -e
```

Add this line for daily backups at 2 AM:

```
0 2 * * * /home/yourusername/supabase-backup.sh >> /home/yourusername/supabase-backup.log 2>&1
```

**Common cron schedules:**
- Daily at 2 AM: `0 2 * * *`
- Every 6 hours: `0 */6 * * *`
- Weekly (Sunday 3 AM): `0 3 * * 0`
- Monthly (1st day, 1 AM): `0 1 1 * *`

---

## Best Practices

### Security
1. **Never commit backups to version control** - Add `*.sql` and `*.sql.gz` to `.gitignore`
2. **Encrypt sensitive backups** before storing in cloud:
   ```bash
   gpg -c backup.sql  # Creates backup.sql.gpg
   ```
3. **Use environment variables** for passwords in scripts
4. **Restrict backup file permissions**:
   ```bash
   chmod 600 backup.sql
   ```

### Storage
1. **Keep multiple backup versions** - Don't overwrite your only backup
2. **Store backups in multiple locations**:
   - Local machine
   - External hard drive
   - Cloud storage (Google Drive, Dropbox, S3)
3. **Test your backups regularly** - Restore to a test database to verify

### Backup Frequency
- **Development databases**: Daily or weekly
- **Production databases**: Multiple times per day
- **Critical applications**: Consider Supabase's Point-in-Time Recovery (PITR)

### What's Included in Backups
✅ **Included:**
- All table data
- Database schema (tables, views, functions)
- Indexes and constraints
- Sequences and serial values

❌ **Not Included:**
- Files stored via Supabase Storage (only metadata)
- Realtime subscriptions configuration
- Edge Functions code

### File Size Management
For large databases:
- Use compressed backups (`.sql.gz`)
- Consider dumping specific tables only:
  ```bash
  sudo docker run --rm postgres:15 pg_dump \
    "postgresql://..." \
    -t table_name1 -t table_name2 > partial-backup.sql
  ```

### Monitoring
Create a log to track your backups:
```bash
echo "$(date): Backup successful - backup-$DATE.sql.gz" >> ~/backup-log.txt
```

---

## Troubleshooting

### Error: "server version mismatch"
Use Docker method or upgrade your PostgreSQL client to version 15+

### Error: "could not translate host name"
Your password contains special characters - URL-encode them (especially `@`)

### Error: "permission denied" (Docker)
Run with `sudo` or add your user to docker group

### Error: "connection timeout"
Check your internet connection and Supabase project status

### Backup file is empty
Check that your connection string is correct and you have data in your database

---

## Quick Reference

### Backup Commands

**Docker (Recommended):**
```bash
sudo docker run --rm postgres:15 pg_dump "CONNECTION_STRING" > backup.sql
```

**PostgreSQL Client:**
```bash
pg_dump "CONNECTION_STRING" > backup.sql
```

**Supabase CLI:**
```bash
supabase db dump --db-url "CONNECTION_STRING" -f backup.sql
```

### Restore Commands

**Docker:**
```bash
sudo docker run --rm -i postgres:15 psql "CONNECTION_STRING" < backup.sql
```

**PostgreSQL Client:**
```bash
psql "CONNECTION_STRING" < backup.sql
```

**Supabase CLI:**
```bash
supabase db execute --db-url "CONNECTION_STRING" -f backup.sql
```

---

## Additional Resources

- [Supabase Backup Documentation](https://supabase.com/docs/guides/platform/backups)
- [PostgreSQL pg_dump Documentation](https://www.postgresql.org/docs/current/app-pgdump.html)
- [Supabase CLI Documentation](https://supabase.com/docs/reference/cli)

---

**Remember:** Always test your restore process before you need it in an emergency!

---

## When Backups Will Work vs Won't Work

### ✅ Scenarios Where Backups WILL Save You

#### 1. **Accidental Data Deletion**
- **Example**: You run `DELETE FROM users WHERE id = 5` but forget the WHERE clause and delete all users
- **Recovery**: Restore from backup taken before the deletion
- **Success Rate**: 100% (if backup exists from before the incident)

#### 2. **Bad Migration or Schema Changes**
- **Example**: You add a migration that drops a critical column or changes data types incorrectly
- **Recovery**: Restore the database to state before migration
- **Success Rate**: 100%

#### 3. **Corrupted Application Logic**
- **Example**: A bug in your app updates all user balances to $0
- **Recovery**: Restore from last known good backup
- **Success Rate**: High (you lose data between backup and incident)

#### 4. **Malicious SQL Injection Attack**
- **Example**: Attacker deletes or modifies data through SQL injection
- **Recovery**: Restore from pre-attack backup
- **Success Rate**: High (if detected quickly)

#### 5. **Testing/Development Mistakes**
- **Example**: You accidentally connected your dev app to production and wrote test data
- **Recovery**: Restore production from backup
- **Success Rate**: 100%

#### 6. **Failed Software Updates**
- **Example**: New version of your app has a bug that corrupts data
- **Recovery**: Restore backup and fix the bug before redeploying
- **Success Rate**: High

#### 7. **Switching Between Supabase Projects**
- **Example**: You want to move your database to a different Supabase project
- **Recovery**: Create backup from old project, restore to new project
- **Success Rate**: 100%

#### 8. **Cloning Production to Staging**
- **Example**: You need real production data in your staging environment
- **Recovery**: Backup production, restore to staging
- **Success Rate**: 100%

---

### ❌ Scenarios Where Backups WON'T Help

#### 1. **Complete Supabase Project Deletion**
- **Example**: You delete your entire Supabase project
- **Why it fails**: All automatic Supabase backups are deleted with the project
- **Solution**: MUST have external backups (using Docker/pg_dump method)
- **Prevention**: Always maintain external backups separate from Supabase

#### 2. **Lost Storage Files (Images, Videos, Documents)**
- **Example**: Users upload profile pictures stored in Supabase Storage, then you delete the bucket
- **Why it fails**: Database backups only contain Storage metadata, not actual files
- **Solution**: Separately backup Storage files using Supabase Storage API or CLI
- **Prevention**: 
  ```bash
  # Backup storage files separately
  supabase storage download --bucket-id avatars --destination ./storage-backup/
  ```

#### 3. **Real-time Subscriptions & Edge Functions**
- **Example**: You delete your Edge Functions code or Realtime subscription configs
- **Why it fails**: These aren't part of the database
- **Solution**: Keep Edge Functions in version control (Git)
- **Prevention**: Store all code in Git repositories

#### 4. **Account-Level Issues**
- **Example**: Your Supabase account gets suspended or billing issues cause project suspension
- **Why it fails**: You might not be able to access your project to create backups
- **Solution**: Maintain regular automated external backups
- **Prevention**: Set up automated backups that run independently

#### 5. **Data Loss Between Backup Intervals**
- **Example**: You backup daily at 2 AM, database gets corrupted at 11 PM
- **Why it fails**: You lose 21 hours of data
- **Solution**: More frequent backups or Point-in-Time Recovery (PITR)
- **Prevention**: 
  - Hourly backups for critical systems
  - Enable Supabase PITR (paid feature) for 2-minute recovery points

#### 6. **Gradual Data Corruption Not Noticed**
- **Example**: A bug slowly corrupts data over 2 weeks, you only keep 7 days of backups
- **Why it fails**: All your backups contain corrupted data
- **Solution**: Keep backups for longer periods with different retention policies
- **Prevention**:
  ```
  Daily backups: Keep 30 days
  Weekly backups: Keep 12 weeks
  Monthly backups: Keep 12 months
  ```

#### 7. **Infrastructure-Level Disasters**
- **Example**: AWS region outage where your Supabase and backups are stored
- **Why it fails**: Both primary database and backups are unavailable
- **Solution**: Geographic redundancy - store backups in different cloud providers/regions
- **Prevention**: 
  - Store backups locally AND in cloud
  - Use multiple cloud providers (AWS, Google Drive, Dropbox)

#### 8. **Compromised Database Credentials**
- **Example**: Attacker gets your database password and continuously deletes data
- **Why it fails**: They can also delete your backups if they have access
- **Solution**: Rotate credentials immediately, restore from offline/immutable backups
- **Prevention**: 
  - Regular credential rotation
  - Immutable backup storage (S3 with object lock)
  - Monitor for suspicious activity

#### 9. **Schema-Only Corruption**
- **Example**: Critical database functions or triggers get dropped but data remains
- **Why it fails**: Standard data backups might not include all database objects
- **Solution**: Use full schema backups including functions, triggers, views
- **Prevention**:
  ```bash
  # Full backup including everything
  pg_dump --clean --if-exists --create "CONNECTION_STRING" > full-backup.sql
  ```

#### 10. **Compliance/Legal Data Deletion**
- **Example**: GDPR request requires permanent deletion of user data
- **Why it fails**: Backups retain the data that must be deleted
- **Solution**: Implement point-in-time deletion across all backups
- **Prevention**: Build GDPR-compliant backup strategies from the start

---

### 🛡️ Comprehensive Protection Strategy

To maximize your protection, implement multiple layers:

#### **Layer 1: Frequent Automatic Backups**
```bash
# Hourly backups for critical data
0 * * * * ~/supabase-backup.sh
```

#### **Layer 2: Multiple Retention Periods**
- Hourly: Keep 24 hours
- Daily: Keep 30 days  
- Weekly: Keep 12 weeks
- Monthly: Keep 12 months

#### **Layer 3: Geographic Redundancy**
Store backups in multiple locations:
- Local machine
- External hard drive (offline)
- Cloud storage (different provider than Supabase)

#### **Layer 4: Separate Storage Backups**
```bash
# Backup Supabase Storage files
supabase storage download --bucket-id bucket-name --destination ./storage-backup/
```

#### **Layer 5: Version Control for Code**
- Edge Functions in Git
- Database migration scripts in Git
- Application code in Git

#### **Layer 6: Monitoring & Alerts**
```bash
# Add to backup script
if [ $? -eq 0 ]; then
    echo "✅ Backup successful"
else
    # Send alert (email, Slack, etc.)
    curl -X POST "https://hooks.slack.com/..." -d '{"text":"❌ Backup failed!"}'
fi
```

#### **Layer 7: Regular Restore Testing**
Monthly test:
1. Restore backup to a test database
2. Verify data integrity
3. Test application connectivity
4. Document any issues
