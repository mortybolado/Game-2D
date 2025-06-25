<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>2D Game - Skill Tree & AI Update</title>
    <style>
        html, body { margin: 0; padding: 0; overflow: hidden; height: 100%; width: 100%; font-family: 'Courier New', Courier, monospace; }
        canvas { display: block; background-color: #0d1117; cursor: crosshair; }
        .hud-button {
            position: fixed;
            top: 10px;
            z-index: 100;
            padding: 8px 12px;
            font-size: 16px;
            background-color: #333;
            color: white;
            border: 2px solid #555;
            border-radius: 5px;
            cursor: pointer;
        }
        #skillTreeButton { right: 10px; }
        .modal-panel {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(20, 20, 30, 0.95);
            border: 2px solid #0095DD;
            border-radius: 10px;
            z-index: 99;
            color: white;
            padding: 20px;
            box-sizing: border-box;
            display: none;
        }
        #skillTreePanel {
            width: 90%;
            max-width: 1200px;
            height: 90%;
            max-height: 800px;
            padding-top: 60px;
        }
        .modal-close-button {
            position: absolute;
            top: 10px;
            right: 15px;
            font-size: 30px;
            background: none;
            border: none;
            color: white;
            cursor: pointer;
        }
        #skillTreeHeader {
            position: absolute;
            top: 15px;
            left: 20px;
            width: calc(100% - 40px);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        #skillTreeContainer { display: flex; justify-content: space-around; height: 100%; gap: 20px; }
        .skill-tree { flex: 1; border: 1px solid #444; border-radius: 5px; padding: 10px; overflow-y: auto; background: #111; }
        .skill-tree.locked { filter: grayscale(80%) brightness(0.6); user-select: none; }
        .tree-header { text-align: center; font-size: 20px; margin-bottom: 15px; }
        .skill-perk {
            background: #2a2a3a;
            border: 1px solid #444;
            border-left: 5px solid #666;
            padding: 10px;
            margin-bottom: 10px;
            border-radius: 3px;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        .skill-perk:hover { background-color: #3a3a4a; }
        .skill-perk.can-unlock { border-left-color: #7CFC00; }
        .skill-perk.maxed { border-left-color: #FFA500; cursor: not-allowed; opacity: 0.7; }
        .skill-perk.locked { cursor: not-allowed; opacity: 0.5; }
        .perk-title { font-weight: bold; }
        .perk-desc { font-size: 14px; color: #ccc; margin: 5px 0; }
        .perk-level { font-size: 12px; color: #999; }
    </style>
</head>
<body>
    <canvas id="gameCanvas"></canvas>
    <button id="skillTreeButton" class="hud-button">SKILLS (K)</button>
    <div id="skillTreePanel" class="modal-panel">
        <div id="skillTreeHeader">
            <h2>SKILL TREES</h2>
            <div id="skillPointsDisplay">Skill Points: 0</div>
        </div>
        <button id="skillTreeCloseButton" class="modal-close-button">×</button>
        <div id="skillTreeContainer"></div>
    </div>

    <script>
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');

        // --- GAME CONSTANTS & STATE ---
        const GRAVITY = 0.5;
        const BASE_PLAYER_PROJECTILE_DAMAGE = 10;
        const BASE_SHOOT_COOLDOWN = 170;
        const BASE_PLAYER_MAX_HP = 100;
        const BOSS_SPAWN_LEVEL = 10;
        let PLATFORM_Y_LIMIT;

        let playerProjectiles = [], enemyProjectiles = [], enemies = [], thunderbolts = [], damageNumbers = [], explosions = [];
        let keys = {}, mouse = { x: 0, y: 0 };
        let isMouseDown = false, lastShotTime = 0, lastEnemySpawnTime = 0;
        let isGameOver = false, isChoosingPowerUp = false, isBossActive = false, isSkillTreeOpen = false;
        let level10BossDefeated = false;
        let currentPowerUpChoices = [], lastThunderstrikeTime = 0;
        let screenShake = { intensity: 0, endTime: 0 };

        let skillTrees = {};

        const createSkillTrees = () => ({
            fire: {
                name: "Path of Inferno", icon: "🔥", unlocked: false,
                perks: {
                    'fire_ammo': { name: "Ignition Rounds", maxLevel: 1, cost: 1, desc: "Your shots now deal Fire damage, burning enemies.", effect: (p) => { p.currentElement = 'fire'; p.fire_unlocked = true; }},
                    'burn_damage': { name: "Intensify Flame", maxLevel: 5, cost: 1, desc: "Increases burn damage by 10% per level.", requires: 'fire_ammo', effect: (p) => p.fire_burnDamageBonus += 0.1 },
                    'explosive_rounds': { name: "Explosive Pyre", maxLevel: 1, cost: 2, desc: "Your projectiles explode on impact.", requires: 'burn_damage', effect: (p) => p.hasExplosive = true },
                }
            },
            ice: {
                name: "Path of Frost", icon: "❄️", unlocked: false,
                perks: {
                    'ice_ammo': { name: "Frigid Bolts", maxLevel: 1, cost: 1, desc: "Your shots now deal Ice damage, slowing enemies.", effect: (p) => { p.currentElement = 'ice'; p.ice_unlocked = true; } },
                    'slow_potency': { name: "Permafrost", maxLevel: 5, cost: 1, desc: "Increases the slow duration by 0.5s per level.", requires: 'ice_ammo', effect: (p) => p.ice_slowDurationBonus += 500 },
                    'shatter': { name: "Shatter", maxLevel: 1, cost: 2, desc: "Killing a frozen enemy causes a damaging ice shard explosion.", requires: 'slow_potency', effect: (p) => p.ice_shatter = true },
                }
            },
            poison: {
                name: "Path of Venom", icon: "☣️", unlocked: false,
                perks: {
                    'poison_ammo': { name: "Toxic Strikes", maxLevel: 1, cost: 1, desc: "Your shots now deal Poison damage.", effect: (p) => { p.currentElement = 'poison'; p.poison_unlocked = true; } },
                    'poison_duration': { name: "Lingering Toxins", maxLevel: 5, cost: 1, desc: "Increases poison duration by 1s per level.", requires: 'poison_ammo', effect: (p) => p.poison_durationBonus += 1000 },
                    'corrosive': { name: "Corrosive Bile", maxLevel: 1, cost: 2, desc: "Poisoned enemies take 25% more damage from all sources.", requires: 'poison_duration', effect: (p) => p.poison_corrosive = true },
                }
            },
            electric: {
                name: "Path of Storms", icon: "⚡", unlocked: false,
                perks: {
                    'electric_ammo': { name: "Charged Shots", maxLevel: 1, cost: 1, desc: "Your shots now deal Electric damage, with a chance to stun.", effect: (p) => { p.currentElement = 'electric'; p.electric_unlocked = true; } },
                    'stun_chance': { name: "High Voltage", maxLevel: 5, cost: 1, desc: "Increases stun chance by 3% per level.", requires: 'electric_ammo', effect: (p) => p.electric_stunChanceBonus += 0.03 },
                    'chain_lightning': { name: "Chain Lightning", maxLevel: 1, cost: 2, desc: "Stunned enemies release a bolt of chain lightning.", requires: 'stun_chance', effect: (p) => p.electric_chain = true },
                }
            }
        });

        const player = {
            x: 100, y: 100, width: 50, height: 50, color: '#0095DD', speed: 5, jumpStrength: -12, dx: 0, dy: 0, isJumping: false,
            level: 1, exp: 0, expToNextLevel: 100, hp: 100, maxHp: BASE_PLAYER_MAX_HP, isInvulnerable: false, invulnerabilityEndTime: 0, invulnerabilityCooldownEndTime: 0,
            damageMultiplier: 1.0, expMultiplier: 1.0, attackSpeedMultiplier: 1.0, critChance: 0.0, critDamageMultiplier: 2.0,
            hasThunderstrike: false, hasDoubleShot: false, hasHitKill: false, hasExplosive: false,
            skillPoints: 0, unlockedTreeCount: 0, currentElement: 'none',
            perkLevels: {},
            fire_unlocked: false, fire_burnDamageBonus: 0, ice_unlocked: false, ice_slowDurationBonus: 0, ice_shatter: false,
            poison_unlocked: false, poison_durationBonus: 0, poison_corrosive: false, electric_unlocked: false, electric_stunChanceBonus: 0, electric_chain: false,
            comboKills: 0, lastComboKillTime: 0, comboBuffEndTime: 0, overloadCharge: 0, maxOverloadCharge: 2500, isOverloaded: false, overloadEndTime: 0,

            draw: function() {
                if (this.isInvulnerable) { ctx.globalAlpha = (Date.now() % 200 < 100) ? 0.5 : 1.0; }
                if (this.isOverloaded) { const pulse = (Math.sin(Date.now() / 100) + 1) / 2; ctx.fillStyle = `rgb(255, ${100 + 155 * pulse}, 0)`; } 
                else { ctx.fillStyle = this.color; }
                ctx.fillRect(this.x, this.y, this.width, this.height);
                ctx.globalAlpha = 1.0;
            },
            jump: function() { if (!this.isJumping) { this.dy = this.jumpStrength; this.isJumping = true; } },
            addExp: function(amount) {
                this.exp += Math.floor(amount * this.expMultiplier);
                while (this.exp >= this.expToNextLevel) {
                    this.exp -= this.expToNextLevel; this.level++; this.skillPoints++;
                    this.expToNextLevel = Math.floor(100 * Math.pow(1.15, this.level - 1));
                    isChoosingPowerUp = true;
                    if (this.level % 5 === 0) {
                        generatePowerUpChoices(3);
                        currentPowerUpChoices.unshift({ id:'heal', icon: '❤️‍🩹', title: 'Heal', description: () => 'Fully restore your HP.', rarity: 'Epic', color: '#9370DB', applyEffect: (p) => { p.hp = p.maxHp; } });
                    } else {
                        generatePowerUpChoices(3);
                    }
                }
            },
            takeDamage: function(damage) {
                if (this.isInvulnerable) return;
                const now = Date.now();
                this.hp -= damage;
                this.isInvulnerable = true; this.invulnerabilityEndTime = now + 2000;
                triggerScreenShake(8, 250);
                if (this.hp <= 0) { this.hp = 0; isGameOver = true; }
            },
            update: function() {
                if (this.isInvulnerable && Date.now() > this.invulnerabilityEndTime) this.isInvulnerable = false;
                if (keys['a'] || keys['A']) this.x -= this.speed; if (keys['d'] || keys['D']) this.x += this.speed;
                this.dy += GRAVITY; this.y += this.dy;
                if (this.y + this.height > canvas.height) { this.y = canvas.height - this.height; this.dy = 0; this.isJumping = false; }
                if (this.x < 0) this.x = 0; if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
            }
        };
        
        const powerUpPool = [
            { id: 'damage', rarity: ['Common', 'Rare', 'Epic'], icon: '💥', title: 'Damage Boost', description: (val) => `Increase damage by ${val}%.`, applyEffect: (p, val) => { p.damageMultiplier += val / 100; }},
            { id: 'attack_speed', rarity: ['Common', 'Rare'], icon: '⚡', title: 'Attack Speed', description: (val) => `Increase attack speed by ${val}%.`, applyEffect: (p, val) => { p.attackSpeedMultiplier += val / 100; }},
            { id: 'max_hp', rarity: ['Common', 'Rare'], icon: '❤️', title: 'HP Boost', description: (val) => `Increase Max HP by ${val}.`, applyEffect: (p, val) => { p.maxHp += val; }},
            { id: 'crit_chance', rarity: ['Rare', 'Epic'], icon: '🎯', title: 'Critical Chance', description: (val) => `Increase Critical Hit Chance by ${val}%.`, applyEffect: (p, val) => { p.critChance += val / 100; }},
            { id: 'crit_damage', rarity: ['Epic', 'Legendary'], icon: '☠️', title: 'Critical Damage', description: (val) => `Increase Critical Hit Damage by an additional ${val}%.`, applyEffect: (p, val) => { p.critDamageMultiplier += val / 100; }},
            { id: 'thunderstrike', rarity: ['Legendary'], icon: '🌩️', title: 'Thunderstrike', description: () => "2 thunderbolts strike every 5s.", applyEffect: (p) => { p.hasThunderstrike = true; }},
            { id: 'double_shot', rarity: ['Epic'], icon: '••', title: 'Parallel Shot', description: () => "Fire two projectiles at once.", applyEffect: (p) => { p.hasDoubleShot = true; }},
            { id: 'hitkill', rarity: ['Mythic'], icon: '💀', title: 'One-Hit Kill', description: () => '1% chance to instantly kill non-boss enemies. Deals massive damage to bosses.', applyEffect: (p) => { p.hasHitKill = true; }},
        ];
        
        class Projectile { /* ... as before ... */ constructor(config) { this.x = config.x; this.y = config.y; this.radius = 5; this.damage = config.damage; this.isCrit = config.isCrit; this.element = config.element || 'none'; this.color = { 'none': '#00BFFF', 'fire': '#FF4500', 'ice': '#ADD8E6', 'poison': '#9ACD32', 'electric': '#FFD700' }[this.element]; const angle = Math.atan2(config.dy, config.dx); this.dx = Math.cos(angle) * 9; this.dy = Math.sin(angle) * 9; } update() { this.x += this.dx; this.y += this.dy; } draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fillStyle = this.color; ctx.fill(); ctx.closePath(); }}
        class Explosion { /* ... as before ... */ constructor(x, y, radius, damage, element = 'fire') { this.x = x; this.y = y; this.maxRadius = radius; this.damage = damage; this.creationTime = Date.now(); this.duration = 200; this.hitEnemies = []; this.element = element; } draw() { const elapsed = Date.now() - this.creationTime; const progress = elapsed / this.duration; const currentRadius = this.maxRadius * progress; const alpha = 1 - progress; let color; if(this.element === 'ice') color = `rgba(173, 216, 230, ${alpha * 0.8})`; else color = `rgba(255, 165, 0, ${alpha * 0.8})`; ctx.beginPath(); ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); }}
        class Thunderbolt { /* ... as before ... */ constructor(x) { this.x = x; this.width = 25; this.height = canvas.height; this.creationTime = Date.now(); this.chargingDuration = 1500; this.strikeDuration = 150; this.disintegrationDuration = 500; this.totalDuration = this.chargingDuration + this.strikeDuration + this.disintegrationDuration; this.state = 'charging'; this.hasDealtDamage = false; } update() {const e=Date.now()-this.creationTime;if(this.state==='charging'){if(e>=this.chargingDuration)this.state='striking'}else if(this.state==='striking'){if(e>=this.chargingDuration+this.strikeDuration)this.state='done'}} draw() { const e=Date.now()-this.creationTime; if(this.state==='charging'){const p=e/this.chargingDuration;ctx.fillStyle=`rgba(255,255,150,${p*.4})`;ctx.fillRect(this.x-this.width/2,0,this.width,this.height)}else if(this.state==='striking'){if(Date.now()%50>25){ctx.fillStyle="rgba(255,255,255,0.95)";ctx.fillRect(this.x-this.width/2,0,this.width,this.height)}}}}
        class BaseEnemy {
            constructor(config) {
                this.width = config.width; this.height = config.height; this.x = config.x; this.y = -this.height; this.color = config.color;
                this.baseSpeed = config.speed; this.speed = this.baseSpeed;
                this.maxHp = config.maxHp + (player.level * 15); this.hp = this.maxHp;
                this.expReward = config.expReward + (player.level * 5);
                this.shootInterval = (config.shootInterval || 2000) + 500;
                this.lastShotTime = Date.now(); this.state = "descending";
                this.settleHeight = Math.random() * (PLATFORM_Y_LIMIT - 100);
                this.desiredDistance = config.desiredDistance || 300;
                this.statusEffects = { fire: { endTime: 0, damage: 0, lastTick: 0 }, ice: { endTime: 0 }, poison: { endTime: 0, damage: 0, lastTick: 0 }, electric: { endTime: 0 } };
            }
            draw() { ctx.save(); if (this.statusEffects.ice.endTime > Date.now()) ctx.filter = 'saturate(0.3) brightness(1.5)'; if (this.statusEffects.electric.endTime > Date.now() && Date.now() % 100 < 50) ctx.filter = 'brightness(2)'; ctx.fillStyle = this.color; ctx.fillRect(this.x, this.y, this.width, this.height); ctx.restore(); const barWidth = this.width, barHeight = 5, barY = this.y - barHeight - 2; ctx.fillStyle = "#333"; ctx.fillRect(this.x, barY, barWidth, barHeight); ctx.fillStyle = "#dc3545"; ctx.fillRect(this.x, barY, barWidth * (this.hp / this.maxHp), barHeight); }
            takeDamage(damage, isCrit = false, isHitKill = false, element) {
                if (element === 'poison' && player.poison_corrosive) damage *= 1.25;
                this.hp -= damage;
                player.overloadCharge += damage;
                damageNumbers.push({ value: isHitKill ? 'INSTA-KILL!' : Math.round(damage), x: this.x + this.width / 2, y: this.y, creationTime: Date.now(), color: isHitKill ? '#B22222' : 'white', isCrit: isCrit || isHitKill });
            }
            applyStatusEffect(element, duration, value) { const now = Date.now(); this.statusEffects[element].endTime = now + duration; if(value) this.statusEffects[element].damage = value; }
            updateStatusEffects() {
                const now = Date.now();
                const fire = this.statusEffects.fire; if (fire.endTime > now && now > fire.lastTick + 1000) { this.takeDamage(fire.damage * (1 + player.fire_burnDamageBonus), false, false, 'fire'); fire.lastTick = now; }
                const poison = this.statusEffects.poison; if (poison.endTime > now && now > poison.lastTick + 1000) { this.takeDamage(poison.damage, false, false, 'poison'); poison.lastTick = now; }
                this.speed = (this.statusEffects.ice.endTime > now) ? this.baseSpeed * 0.5 : this.baseSpeed;
            }
            update(player) {
                this.updateStatusEffects();
                if (this.statusEffects.electric.endTime > Date.now()) return;
                if (this.state === "descending") { this.y += 2; if (this.y >= this.settleHeight) { this.y = this.settleHeight; this.state = "attacking"; } }
                else if (this.state === "attacking") { this.performAttackBehavior(player); }
            }
            shoot(target) { const now = Date.now(); if (now - this.lastShotTime > this.shootInterval) { const startX = this.x + this.width / 2, startY = this.y + this.height / 2; const dx = target.x + target.width / 2 - startX; const dy = target.y + target.height / 2 - startY; enemyProjectiles.push(new Projectile({x: startX, y: startY, dx: dx, dy: dy, speed: 4, damage: 10, radius: 5 })); this.lastShotTime = now; } }
            performAttackBehavior(player) {
                let move = { x: 0, y: 0 };
                const distanceToPlayer = Math.hypot(this.x - player.x, this.y - player.y);
                if (distanceToPlayer > this.desiredDistance + 50) { move.x += (player.x - this.x); move.y += (player.y - this.y); } 
                else if (distanceToPlayer < this.desiredDistance - 50) { move.x -= (player.x - this.x); move.y -= (player.y - this.y); }
                
                let closestProj = null, minDist = 200;
                for (const p of playerProjectiles) {
                    const dist = Math.hypot(this.x - p.x, this.y - p.y);
                    if (dist < minDist) { minDist = dist; closestProj = p; }
                }
                if (closestProj) {
                    const dodgePower = (200 - minDist) / 200;
                    move.x += -closestProj.dy * dodgePower * 2;
                    move.y += closestProj.dx * dodgePower * 2;
                }
                if (this.x < 50) move.x += 1.5;
                if (this.x > canvas.width - 50) move.x -= 1.5;

                const moveMag = Math.hypot(move.x, move.y);
                if (moveMag > 0) { this.x += (move.x / moveMag) * this.speed; this.y += (move.y / moveMag) * this.speed; }

                this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
                this.y = Math.max(0, Math.min(PLATFORM_Y_LIMIT - this.height, this.y));
                
                this.shoot(player);
            }
        }
        class MOB extends BaseEnemy { constructor(spawnX) { super({ x: spawnX, width: 35, height: 35, color: "#e91e63", speed: 1.5, maxHp: 30, expReward: 10, shootInterval: 2500 }); } }
        class MOBTANK extends BaseEnemy { constructor(spawnX) { super({ x: spawnX, width: 55, height: 55, color: "#673ab7", speed: 0.6, maxHp: 100, expReward: 25, shootInterval: 4000 }); } takeDamage(d,i,h,e){if(this.hp/this.maxHp>.5){super.takeDamage(d*.2,i,h,e)}else{super.takeDamage(d,i,h,e)}} }
        class MOBSPEED extends BaseEnemy { constructor(spawnX) { super({ x: spawnX, width: 30, height: 30, color: "#ff9800", speed: 2.8, maxHp: 20, expReward: 15, shootInterval: 1800, desiredDistance: 450 }); } }
        class BossEnemy extends BaseEnemy { constructor(spawnX) { super({ x: spawnX, width: 150, height: 150, color: "#b80f0a", speed: 1, maxHp: 3000, expReward: 1000, shootInterval: 1800 }); } performAttackBehavior(player) {this.x += this.speed; if(this.x<0||this.x+this.width>canvas.width)this.speed*=-1; this.shoot(player);} }
        
        // --- Game Logic ---
        function handleShooting() { /* ... as before ... */ }
        function handleCollisions() { /* ... as before ... */ }
        function updatePlayerSystems() { /* ... as before ... */ }
        function drawHUD() { /* ... as before ... */ }
        function resetGame(){
            player.level=1; player.exp=0; player.expToNextLevel=100; player.maxHp=BASE_PLAYER_MAX_HP; player.hp=BASE_PLAYER_MAX_HP;
            player.x=canvas.width/2-player.width/2; player.y=canvas.height-player.height; player.isInvulnerable=false;
            player.damageMultiplier=1.0; player.expMultiplier=1.0; player.attackSpeedMultiplier=1.0; player.critChance=0.0; player.critDamageMultiplier=2.0;
            player.hasThunderstrike=false; player.hasDoubleShot=false; player.hasHitKill=false; player.hasExplosive = false;
            player.skillPoints=0; player.unlockedTreeCount=0; player.currentElement='none'; player.perkLevels={};
            player.fire_unlocked=false; player.fire_burnDamageBonus=0; player.ice_unlocked=false; player.ice_slowDurationBonus=0; player.ice_shatter=false;
            player.poison_unlocked=false; player.poison_durationBonus=0; player.poison_corrosive=false; player.electric_unlocked=false; player.electric_stunChanceBonus=0; player.electric_chain=false;
            player.comboKills=0; player.lastComboKillTime=0; player.comboBuffEndTime=0; player.overloadCharge=0; player.isOverloaded=false; player.overloadEndTime=0;
            skillTrees = createSkillTrees();
            enemies=[];playerProjectiles=[];enemyProjectiles=[];thunderbolts=[];damageNumbers=[];explosions=[];
            isGameOver=false;isBossActive=false;level10BossDefeated=false; lastEnemySpawnTime=0;lastThunderstrikeTime=0;isChoosingPowerUp=false;currentPowerUpChoices=[]; isSkillTreeOpen = false;
        }
        
        // --- Full Function Definitions ---
        function triggerScreenShake(intensity, duration) { screenShake.intensity = intensity; screenShake.endTime = Date.now() + duration; }
        function handleThunderstrike() { if (!player.hasThunderstrike) return; if (Date.now() - lastThunderstrikeTime > 5000) { thunderbolts.push(new Thunderbolt(Math.random() * canvas.width)); thunderbolts.push(new Thunderbolt(Math.random() * canvas.width)); lastThunderstrikeTime = Date.now(); } }
        function handleShooting() {
            let tempAttackSpeedMultiplier = Date.now() < player.comboBuffEndTime ? 1.5 : 1.0;
            if (player.isOverloaded) tempAttackSpeedMultiplier *= 2.0;
            const shootCooldown = BASE_SHOOT_COOLDOWN / (player.attackSpeedMultiplier * tempAttackSpeedMultiplier);
            if (isMouseDown && !isGameOver && !isSkillTreeOpen) {
                const now = Date.now();
                if (now - lastShotTime > shootCooldown) {
                    const startX = player.x + player.width / 2, startY = player.y + player.height / 2;
                    let dx = mouse.x - startX, dy = mouse.y - startY;
                    let isCrit = Math.random() < player.critChance;
                    let tempDamageMultiplier = player.isOverloaded ? 1.5 : 1.0;
                    let damage = BASE_PLAYER_PROJECTILE_DAMAGE * player.damageMultiplier * tempDamageMultiplier;
                    if (isCrit) { damage *= player.critDamageMultiplier; }
                    const createProjectile = (px, py, angleOffset = 0) => {
                        const angle = Math.atan2(dy, dx) + angleOffset;
                        playerProjectiles.push(new Projectile({ x: px, y: py, dx: Math.cos(angle), dy: Math.sin(angle), damage, isCrit, element: player.currentElement }));
                    };
                    if (player.hasDoubleShot) { const perpX = -dy / Math.hypot(dx,dy), perpY = dx / Math.hypot(dx,dy); createProjectile(startX + perpX * 15, startY + perpY * 15); createProjectile(startX - perpX * 15, startY - perpY * 15); }
                    else { createProjectile(startX, startY); }
                    lastShotTime = now;
                }
            }
        }
        function handleCollisions() {
            for (let i = playerProjectiles.length - 1; i >= 0; i--) { const p = playerProjectiles[i]; if (!p) continue; for (let j = enemies.length - 1; j >= 0; j--) { const e = enemies[j]; if (p.x > e.x && p.x < e.x + e.width && p.y > e.y && p.y < e.y + e.height){ if (player.hasHitKill && Math.random() < 0.01) { e instanceof BossEnemy ? e.takeDamage(e.maxHp * 0.25, true) : e.takeDamage(e.hp, false, true); } else { e.takeDamage(p.damage, p.isCrit, false, p.element); } if (p.element === 'fire') e.applyStatusEffect('fire', 3000, p.damage * 0.2); else if (p.element === 'ice') e.applyStatusEffect('ice', 2000 + player.ice_slowDurationBonus); else if (p.element === 'poison') e.applyStatusEffect('poison', 5000 + player.poison_durationBonus, p.damage * 0.1); else if (p.element === 'electric' && Math.random() < 0.15 + player.electric_stunChanceBonus) { e.applyStatusEffect('electric', 500); if(player.electric_chain) { let chained = false; for(const otherE of enemies){if(otherE !== e && !chained && Math.hypot(e.x-otherE.x, e.y-otherE.y) < 150){otherE.applyStatusEffect('electric', 500); chained=true;}}} } if (player.hasExplosive) { explosions.push(new Explosion(p.x, p.y, 80, p.damage * 0.5)); } playerProjectiles.splice(i,1); if (e.hp <= 0) { if (player.ice_shatter && e.statusEffects.ice.endTime > Date.now()) explosions.push(new Explosion(e.x + e.width/2, e.y + e.height/2, 60, p.damage * 0.4, 'ice')); player.addExp(e.expReward); player.comboKills++; player.lastComboKillTime = Date.now(); if (player.comboKills > 0 && player.comboKills % 5 === 0) { player.comboBuffEndTime = Date.now() + 5000; } if (e instanceof BossEnemy) { isBossActive = false; level10BossDefeated = true; triggerScreenShake(20, 1000); } enemies.splice(j,1); } break; } } }
            for (let i = enemyProjectiles.length - 1; i >= 0; i--) { const p = enemyProjectiles[i]; if (!p) continue; if (p.x > player.x && p.x < player.x + player.width && p.y > player.y && p.y < player.y + player.height) { player.takeDamage(p.damage); enemyProjectiles.splice(i, 1); } }
            for (let i = explosions.length - 1; i >= 0; i--) { const ex = explosions[i]; for (const e of enemies) { if (ex.hitEnemies.includes(e)) continue; if (Math.hypot(ex.x - (e.x + e.width / 2), ex.y - (e.y + e.height / 2)) < ex.maxRadius) { e.takeDamage(ex.damage, true, false, ex.element); ex.hitEnemies.push(e); } } }
            for (const bolt of thunderbolts) { if (bolt.state !== 'striking' || bolt.hasDealtDamage) continue; for (let j = enemies.length - 1; j >= 0; j--) { const enemy = enemies[j]; if (enemy.x + enemy.width > bolt.x - bolt.width / 2 && enemy.x < bolt.x + bolt.width / 2) { if (enemy instanceof BossEnemy) { const damage = enemy.maxHp * (0.10 * player.damageMultiplier); enemy.takeDamage(damage, true); } else { player.addExp(enemy.expReward); enemies.splice(j, 1); } } } bolt.hasDealtDamage = true; }
        }
        function updatePlayerSystems() {
            const now = Date.now();
            if (now > player.lastComboKillTime + 3000) player.comboKills = 0;
            if (now > player.overloadEndTime) { if (player.isOverloaded) player.overloadCharge = 0; player.isOverloaded = false; }
            if (!player.isOverloaded && player.overloadCharge >= player.maxOverloadCharge) { player.isOverloaded = true; player.overloadEndTime = now + 10000; triggerScreenShake(12, 500); }
        }
        function drawHUD() { ctx.font="18px 'Courier New', Courier, monospace"; ctx.fillStyle="white"; ctx.fillText(`Level: ${player.level}`,10,30); ctx.fillStyle="#333"; ctx.fillRect(10,40,200,20); ctx.fillStyle="#dc3545"; ctx.fillRect(10,40,200*(player.hp/player.maxHp),20); ctx.fillStyle="white"; ctx.fillText(`${Math.ceil(player.hp)} / ${player.maxHp}`,15,56); ctx.fillStyle="#333"; ctx.fillRect(10,70,200,15); ctx.fillStyle="#007bff"; ctx.fillRect(10,70,200*(player.exp/player.expToNextLevel),15); ctx.fillStyle="white"; ctx.fillText(`${player.exp} / ${player.expToNextLevel}`,15,83); ctx.fillStyle="#333"; ctx.fillRect(10, 95, 200, 10); ctx.fillStyle= player.isOverloaded ? "#ff0000" : "#ff8c00"; ctx.fillRect(10, 95, 200 * (player.overloadCharge / player.maxOverloadCharge), 10); let hudY = 120; if (player.comboKills > 1) { ctx.font="bold 22px 'Courier New', Courier, monospace"; ctx.fillStyle="orange"; ctx.fillText(`COMBO x${player.comboKills}`, 10, hudY); hudY += 25;} if (Date.now() < player.comboBuffEndTime) { ctx.font="bold 18px 'Courier New', Courier, monospace"; ctx.fillStyle="#ff4500"; ctx.fillText(`COMBO FURY!`, 10, hudY); hudY += 25; } if (player.isOverloaded) { ctx.font="bold 24px 'Courier New', Courier, monospace"; ctx.fillStyle="#ff0000"; ctx.fillText(`OVERLOAD ACTIVE!`, 10, hudY); hudY += 25; } }
        function drawPowerUpScreen() { ctx.fillStyle = "rgba(0,0,0,0.8)"; ctx.fillRect(0,0,canvas.width,canvas.height); const cardWidth = 320, cardHeight = 200, gap = 50, totalWidth = (cardWidth * currentPowerUpChoices.length) + (gap * (currentPowerUpChoices.length-1)); const startX = (canvas.width - totalWidth) / 2, cardY = canvas.height/2 - cardHeight/2; ctx.fillStyle = "white"; ctx.font = "40px 'Courier New', Courier, monospace"; ctx.textAlign = "center"; ctx.fillText("LEVEL UP! CHOOSE AN UPGRADE", canvas.width/2, cardY - 40); currentPowerUpChoices.forEach((powerUp, index) => { const cardX = startX + index * (cardWidth + gap); powerUp.rect = { x: cardX, y: cardY, width: cardWidth, height: cardHeight }; ctx.fillStyle = "#1a1a1a"; ctx.fillRect(cardX, cardY, cardWidth, cardHeight); ctx.strokeStyle = powerUp.color; ctx.lineWidth = 4; ctx.strokeRect(cardX, cardY, cardWidth, cardHeight); ctx.font = "40px 'Courier New', Courier, monospace"; ctx.textAlign = "left"; ctx.fillText(powerUp.icon, cardX + 20, cardY + 55); ctx.font = "24px 'Courier New', Courier, monospace"; ctx.fillStyle = "white"; ctx.fillText(powerUp.title, cardX + 80, cardY + 50); ctx.font = "18px 'Courier New', Courier, monospace"; ctx.fillStyle = powerUp.color; ctx.fillText(powerUp.rarity.toUpperCase(), cardX + 80, cardY + 80); ctx.fillStyle = "#B0B0B0"; ctx.font = "16px 'Courier New', Courier, monospace"; const description = powerUp.description(powerUp.value), words = description.split(' '); let line = '', y = cardY + 120; for (let n = 0; n < words.length; n++) { const testLine = line + words[n] + ' '; const testWidth = ctx.measureText(testLine).width; if (testWidth > cardWidth - 40 && n > 0) { ctx.fillText(line, cardX + 20, y); line = words[n] + ' '; y += 20; } else { line = testLine; } } ctx.fillText(line, cardX + 20, y); }); ctx.textAlign = "left"; }
        function handlePowerUpClick(e) { const bounds = canvas.getBoundingClientRect(); const mouseX = e.clientX - bounds.left; const mouseY = e.clientY - bounds.top; currentPowerUpChoices.forEach(powerUp => { if (powerUp.rect && mouseX > powerUp.rect.x && mouseX < powerUp.rect.x + powerUp.rect.width && mouseY > powerUp.rect.y && mouseY < powerUp.rect.y + powerUp.rect.height) { powerUp.applyEffect(player, powerUp.value); isChoosingPowerUp = false; currentPowerUpChoices = []; } }); }
        function handleSpawning(){ if (player.level >= BOSS_SPAWN_LEVEL && !level10BossDefeated && !isBossActive) { enemies = []; isBossActive = true; enemies.push(new BossEnemy(canvas.width / 2 - 75)); return; } if (isBossActive) return; let maxEnemies; if (player.level <= 20) maxEnemies = 5 + Math.floor((player.level - 1) / 5) * 2; else maxEnemies = 13; if (enemies.length >= maxEnemies) return; const now = Date.now(); const spawnCooldown = Math.max(400, 3000 - player.level * 20); if (now - lastEnemySpawnTime < spawnCooldown) return; const rand = Math.random(); let EnemyClass, enemySize; if (player.level <= 5) { EnemyClass = MOB; enemySize = 35; } else if (player.level <= 10) { if (rand < 0.8) { EnemyClass = MOB; enemySize = 35; } else { EnemyClass = MOBTANK; enemySize = 55; } } else { if (rand < 0.5) { EnemyClass = MOB; enemySize = 35; } else if (rand < 0.8) { EnemyClass = MOBTANK; enemySize = 55; } else { EnemyClass = MOBSPEED; enemySize = 30; } } let spawnX, isOverlapping, tries = 0; do { isOverlapping = false; spawnX = Math.random() * (canvas.width - enemySize); for (const existingEnemy of enemies) { if (spawnX < existingEnemy.x + existingEnemy.width + 10 && spawnX + enemySize > existingEnemy.x - 10) { isOverlapping = true; break; } } tries++; } while (isOverlapping && tries < 20); if (!isOverlapping) { enemies.push(new EnemyClass(spawnX)); lastEnemySpawnTime = now; } }
        function updateAndDrawDamageNumbers() { const now = Date.now(); damageNumbers = damageNumbers.filter(d => now - d.creationTime < 1000); ctx.textAlign = "center"; damageNumbers.forEach(d => { const elapsed = now - d.creationTime; const alpha = 1.0 - (elapsed / 1000); const yOffset = -elapsed * 0.05; if(d.isCrit) { const fontSize = typeof d.value === 'string' ? 28 : 24; ctx.font = `bold ${fontSize}px 'Courier New', Courier, monospace`; ctx.fillStyle = `rgba(${d.color === '#B22222' ? '178,34,34' : '255,255,0'}, ${alpha})`; ctx.fillText(d.value + (typeof d.value === 'number' ? '!' : ''), d.x, d.y + yOffset); } else { ctx.font = "bold 20px 'Courier New', Courier, monospace"; ctx.fillStyle = `rgba(255,255,255, ${alpha})`; ctx.fillText(d.value, d.x, d.y + yOffset); } }); ctx.textAlign = "left"; }
        function drawGameOver(){ ctx.fillStyle="rgba(0,0,0,0.7)";ctx.fillRect(0,0,canvas.width,canvas.height); ctx.fillStyle="white";ctx.font="50px 'Courier New', Courier, monospace";ctx.textAlign="center"; ctx.fillText("GAME OVER",canvas.width/2,canvas.height/2-40); ctx.font="24px 'Courier New', Courier, monospace";ctx.fillText(`You reached Level ${player.level}`,canvas.width/2,canvas.height/2); ctx.font="20px 'Courier New', Courier, monospace";ctx.fillText("Press 'R' to Restart",canvas.width/2,canvas.height/2+50); ctx.textAlign="left"; }
        function handleResize(){ canvas.width=window.innerWidth;canvas.height=window.innerHeight; PLATFORM_Y_LIMIT = canvas.height * 0.75; if(!isGameOver && player){ if(player.y+player.height > canvas.height) player.y=canvas.height-player.height; if(player.x+player.width > canvas.width) player.x=canvas.width-player.width; } }
        function getRandomRarity() { const r = Math.random(); if (r < 0.002) return 'Mythic'; if (r < 0.052) return 'Legendary'; if (r < 0.152) return 'Epic'; if (r < 0.452) return 'Rare'; return 'Common'; }
        function generatePowerUpChoices(numChoices = 3) {
            currentPowerUpChoices = [];
            const rarityColors = {'Common': '#B0B0B0', 'Rare': '#7CFC00', 'Epic': '#9370DB', 'Legendary': '#FFA500', 'Mythic': '#B22222'};
            
            for (let i = 0; i < numChoices; i++) {
                const rarity = getRandomRarity();
                let available = powerUpPool.filter(p => p.rarity.includes(rarity) && !player['has'+p.id.split('_').map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join('')]);
                
                if (available.length === 0) { i--; continue; } // Reroll if no valid powerup found (e.g., all uniques taken)
                
                const powerUpBase = available[Math.floor(Math.random() * available.length)];
                let value = null;
                if(powerUpBase.id.includes('damage') || powerUpBase.id.includes('speed') || powerUpBase.id.includes('crit')) value = 5 + Math.floor(Math.random() * 15);
                else if(powerUpBase.id.includes('hp')) value = 10 + Math.floor(Math.random() * 20);

                currentPowerUpChoices.push({ ...powerUpBase, rarity: rarity, color: rarityColors[rarity], value: value });
            }
        }
        
        // --- Game Loop ---
        function gameLoop() {
            requestAnimationFrame(gameLoop);
            const now = Date.now();
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update and draw game world if not paused by a menu
            if (!isSkillTreeOpen && !isChoosingPowerUp && !isGameOver) {
                updatePlayerSystems(); handleSpawning(); handleShooting(); handleThunderstrike(); player.update();
                enemies.forEach(e => e.update(player));
                [...playerProjectiles, ...enemyProjectiles, ...thunderbolts].forEach(p => { if(p.update) p.update() });
                handleCollisions();
            }
           
            // Filter arrays for performance and to remove off-screen elements
            playerProjectiles = playerProjectiles.filter(p=>p.x > -100 && p.x < canvas.width + 100 && p.y > -100 && p.y < canvas.height + 100);
            enemyProjectiles = enemyProjectiles.filter(p=>p.x > -100 && p.x < canvas.width + 100 && p.y > -100 && p.y < canvas.height + 100);
            explosions = explosions.filter(e => Date.now() - e.creationTime < e.duration);
            thunderbolts = thunderbolts.filter(t => t.state !== 'done');

            // Always draw the current state of the game world
            player.draw(); enemies.forEach(e => e.draw());
            [...playerProjectiles, ...enemyProjectiles, ...thunderbolts, ...explosions].forEach(p => p.draw());
            updateAndDrawDamageNumbers();
            
            // Overlays and HUD are drawn last, on top of everything else
            if (isChoosingPowerUp) drawPowerUpScreen();
            if (isGameOver) drawGameOver();
            
            drawHUD();
        }

        // --- UI & Event Listeners ---
        const skillTreeButton = document.getElementById('skillTreeButton');
        const skillTreePanel = document.getElementById('skillTreePanel');
        const skillTreeCloseButton = document.getElementById('skillTreeCloseButton');
        const skillTreeContainer = document.getElementById('skillTreeContainer');
        const skillPointsDisplay = document.getElementById('skillPointsDisplay');
        function toggleSkillTreeMenu() { isSkillTreeOpen = !isSkillTreeOpen; skillTreePanel.style.display = isSkillTreeOpen ? 'block' : 'none'; if(isSkillTreeOpen) populateSkillTreeMenu(); }
        function populateSkillTreeMenu() {
            skillTreeContainer.innerHTML = '';
            skillPointsDisplay.textContent = `Skill Points: ${player.skillPoints}`;
            for (const treeKey in skillTrees) {
                const tree = skillTrees[treeKey];
                const treeDiv = document.createElement('div');
                treeDiv.className = 'skill-tree';
                if (!tree.unlocked && player.unlockedTreeCount >= 2) treeDiv.classList.add('locked');
                
                const header = document.createElement('div');
                header.className = 'tree-header';
                header.textContent = `${tree.icon} ${tree.name} ${tree.icon}`;
                if (!tree.unlocked && player.unlockedTreeCount < 2) {
                    const unlockBtn = document.createElement('button');
                    unlockBtn.textContent = "Unlock Tree";
                    unlockBtn.onclick = () => {
                        tree.unlocked = true;
                        player.unlockedTreeCount++;
                        populateSkillTreeMenu();
                    };
                    header.appendChild(unlockBtn);
                }
                treeDiv.appendChild(header);

                if(tree.unlocked) {
                    for(const perkId in tree.perks) {
                        const perk = tree.perks[perkId];
                        const perkDiv = document.createElement('div');
                        perkDiv.className = 'skill-perk';
                        const currentLevel = player.perkLevels[perkId] || 0;
                        
                        let canUnlock = player.skillPoints >= perk.cost;
                        let isLocked = false;
                        if (perk.requires) {
                            if (!player.perkLevels[perk.requires]) {
                                canUnlock = false;
                                isLocked = true;
                            }
                        }
                        if (currentLevel >= perk.maxLevel) { canUnlock = false; perkDiv.classList.add('maxed'); }
                        if (!canUnlock) perkDiv.classList.add('locked');
                        if (canUnlock && currentLevel < perk.maxLevel) perkDiv.classList.add('can-unlock');

                        perkDiv.innerHTML = `<div class="perk-title">${perk.name}</div><div class="perk-desc">${perk.desc}</div><div class="perk-level">Level: ${currentLevel} / ${perk.maxLevel}</div>`;
                        
                        if (canUnlock && currentLevel < perk.maxLevel) {
                            perkDiv.onclick = () => {
                                player.skillPoints -= perk.cost;
                                player.perkLevels[perkId] = (player.perkLevels[perkId] || 0) + 1;
                                perk.effect(player);
                                populateSkillTreeMenu();
                            };
                        }
                        treeDiv.appendChild(perkDiv);
                    }
                }
                skillTreeContainer.appendChild(treeDiv);
            }
        }
        skillTreeButton.addEventListener('click', toggleSkillTreeMenu);
        skillTreeCloseButton.addEventListener('click', toggleSkillTreeMenu);
        window.addEventListener('keydown', (e) => { keys[e.key] = true; if (e.key === ' ' && !isGameOver && !isChoosingPowerUp && !isSkillTreeOpen) player.jump(); if (isGameOver && (e.key === 'r' || e.key === 'R')) resetGame(); if(e.key === 'k' || e.key === 'K') toggleSkillTreeMenu(); });
        window.addEventListener('keyup', (e) => { keys[e.key] = false; });
        canvas.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
        canvas.addEventListener('mousedown', (e) => { if (e.button !== 0 || isSkillTreeOpen) return; if (isChoosingPowerUp) { handlePowerUpClick(e); return; } isMouseDown = true; });
        window.addEventListener('mouseup', (e) => { if (e.button === 0) isMouseDown = false; });
        window.addEventListener('resize', handleResize);
        
        handleResize();
        resetGame();
        gameLoop();
    </script>
</body>
</html>
