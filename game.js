const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');

        // --- GAME CONSTANTS ---
        const GRAVITY = 0.5; const BASE_PLAYER_PROJECTILE_DAMAGE = 10; const BASE_SHOOT_COOLDOWN = 170; const BASE_PLAYER_MAX_HP = 100; const BOSS_SPAWN_LEVEL = 10; const INVULNERABILITY_COOLDOWN = 7000; const COMBO_TIMEOUT = 3000; let PLATFORM_Y_LEVEL;

        // --- GAME STATE ---
        let playerProjectiles = [], enemyProjectiles = [], enemies = [], thunderbolts = [], damageNumbers = [];
        let keys = {}, mouse = { x: 0, y: 0 };
        let isMouseDown = false, lastShotTime = 0, lastEnemySpawnTime = 0;
        let isGameOver = false, isChoosingPowerUp = false, isBossActive = false, isSkillTreeOpen = false;
        let level10BossDefeated = false; let currentPowerUpChoices = [], lastThunderstrikeTime = 0;
        let screenShake = { intensity: 0, endTime: 0 };

        // --- PLAYER OBJECT ---
        const player = {
            x: 100, y: 100, width: 50, height: 50, color: '#0095DD', speed: 5, jumpStrength: -12, dx: 0, dy: 0, isJumping: false,
            level: 1, exp: 0, expToNextLevel: 100, hp: 100, maxHp: BASE_PLAYER_MAX_HP, isInvulnerable: false, invulnerabilityEndTime: 0, invulnerabilityCooldownEndTime: 0,
            damageMultiplier: 1.0, expMultiplier: 1.0, attackSpeedMultiplier: 1.0, hpMultiplier: 1.0, critChance: 0.0, critDamageMultiplier: 2.0,
            hasThunderstrike: false, hasDoubleShot: false, hasHitKill: false,
            skills: { skillPoints: 0, unlockedTreeCount: 0, trees: { fire: { level: 0, unlocked: false }, ice: { level: 0, unlocked: false }, poison: { level: 0, unlocked: false }, electric: { level: 0, unlocked: false } } },
            currentElement: 'none', comboKills: 0, lastComboKillTime: 0, comboBuffEndTime: 0, overloadCharge: 0, maxOverloadCharge: 2500, isOverloaded: false, overloadEndTime: 0,
            draw() { if (this.isInvulnerable) { ctx.globalAlpha = (Date.now() % 200 < 100) ? 0.5 : 1.0; } if (this.isOverloaded) { const pulse = (Math.sin(Date.now() / 100) + 1) / 2; ctx.fillStyle = `rgb(255, ${100 + 155 * pulse}, 0)`; } else { ctx.fillStyle = this.color; } ctx.fillRect(this.x, this.y, this.width, this.height); ctx.globalAlpha = 1.0; },
            jump() { if (!this.isJumping) { this.dy = this.jumpStrength; this.isJumping = true; } },
            addExp(amount) {
                this.exp += Math.floor(amount * this.expMultiplier);
                while (this.exp >= this.expToNextLevel) {
                    currentPowerUpChoices = [];
                    this.exp -= this.expToNextLevel; this.level++; this.skills.skillPoints++; this.expToNextLevel = Math.floor(100 * Math.pow(1.15, this.level - 1));
                    isChoosingPowerUp = true;
                    let choiceCount = 3;
                    if (this.level % 5 === 0) {
                        currentPowerUpChoices.push({ id: 'heal', icon: '❤️‍🩹', title: 'Heal', description: () => 'Fully restore your HP.', rarity: 'Epic', color: '#9370DB', value: null, applyEffect: (p) => { p.hp = p.maxHp; } });
                    }
                    generatePowerUpChoices(choiceCount);
                }
            },
            takeDamage(damage) { if (this.isInvulnerable) return; const now = Date.now(); if (now < this.invulnerabilityCooldownEndTime) { this.hp -= damage; } else { this.hp -= damage; this.isInvulnerable = true; this.invulnerabilityEndTime = now + 2000; this.invulnerabilityCooldownEndTime = now + INVULNERABILITY_COOLDOWN; } triggerScreenShake(8, 250); if (this.hp <= 0) { this.hp = 0; isGameOver = true; } },
            update() { if (this.isInvulnerable && Date.now() > this.invulnerabilityEndTime) this.isInvulnerable = false; if (keys['a']) this.x -= this.speed; if (keys['d']) this.x += this.speed; this.dy += GRAVITY; this.y += this.dy; if (this.y + this.height > canvas.height) { this.y = canvas.height - this.height; this.dy = 0; this.isJumping = false; } if (this.x < 0) this.x = 0; if (this.x + this.width > canvas.width) this.x = canvas.width - this.width; }
        };
        
        const powerUpPool = [
            { id: 'damage', icon: '💥', title: 'Damage Boost', description: () => 'Increases damage by 10%.', generate: () => ({ rarity: 'Common' }), applyEffect: (p) => p.damageMultiplier += 0.1 },
            { id: 'attack_speed', icon: '⚡', title: 'Attack Speed', description: () => 'Increases attack speed by 5%.', generate: () => ({ rarity: 'Common' }), applyEffect: (p) => p.attackSpeedMultiplier += 0.05 },
            { id: 'max_hp', icon: '❤️', title: 'HP Boost', description: () => 'Increases Max HP by 15%.', generate: () => ({ rarity: 'Rare' }), applyEffect: (p) => { p.hpMultiplier += 0.15; p.maxHp = Math.floor(BASE_PLAYER_MAX_HP * p.hpMultiplier); } },
            { id: 'crit_chance', icon: '🎯', title: 'Critical Chance', description: () => 'Increases Critical Hit Chance by 5%.', generate: () => ({ rarity: 'Rare' }), applyEffect: (p) => p.critChance += 0.05 },
            { id: 'crit_damage', icon: '☠️', title: 'Critical Damage', description: () => 'Increases Critical Hit Damage by 50%.', generate: () => ({ rarity: 'Epic' }), applyEffect: (p) => p.critDamageMultiplier += 0.5 },
            { id: 'thunderstrike', icon: '🌩️', title: 'Thunderstrike', description: () => "2 thunderbolts strike every 5s.", generate: () => ({ rarity: 'Legendary' }), applyEffect: (p) => p.hasThunderstrike = true },
            { id: 'double_shot', icon: '••', title: 'Parallel Shot', description: () => "Fire two projectiles at once.", generate: () => ({ rarity: 'Epic' }), applyEffect: (p) => p.hasDoubleShot = true },
            { id: 'hitkill', icon: '💀', title: 'One-Hit Kill', description: () => '1% chance to instantly kill non-boss enemies. Deals massive damage to bosses.', generate: () => ({ rarity: 'Mythic' }), applyEffect: (p) => p.hasHitKill = true },
        ];
        
        class Projectile {
            constructor(config) { this.x=config.x;this.y=config.y;this.radius=config.radius||5;this.damage=config.damage;this.isCrit=config.isCrit;this.element=config.element||'none';this.color={'none':'#00BFFF','fire':'#FF4500','ice':'#ADD8E6','poison':'#9ACD32','electric':'#FFD700'}[this.element];const a=Math.atan2(config.dy,config.dx);this.dx=Math.cos(a)*config.speed;this.dy=Math.sin(a)*config.speed }
            update(){ this.x+=this.dx;this.y+=this.dy }
            draw(){ ctx.beginPath();ctx.arc(this.x,this.y,this.radius,0,2*Math.PI);ctx.fillStyle=this.color;ctx.fill();ctx.closePath() }
        }
        class Thunderbolt {
            constructor(x) { this.x = x; this.width = 25; this.height = canvas.height; this.creationTime = Date.now(); this.chargingDuration = 1500; this.strikeDuration = 150; this.totalDuration = this.chargingDuration + this.strikeDuration; this.state = 'charging'; this.hasDealtDamage = false; }
            update() { const elapsed = Date.now() - this.creationTime; if(this.state==='charging' && elapsed >= this.chargingDuration) this.state='striking' }
            draw() { const elapsed=Date.now()-this.creationTime; if(this.state==='charging'){const p=elapsed/this.chargingDuration;ctx.fillStyle=`rgba(255,255,150,${p*.4})`;ctx.fillRect(this.x-this.width/2,0,this.width,this.height)}else if(this.state==='striking'){if(Date.now()%50>25){ctx.fillStyle="rgba(255,255,255,0.95)";ctx.fillRect(this.x-this.width/2,0,this.width,this.height)}} }
        }
        class BaseEnemy {
            constructor(config) {
                this.width=config.width; this.height=config.height; this.x=config.x; this.y=-this.height; this.color=config.color;
                this.baseSpeed=config.speed+(player.level*.05); this.speed=this.baseSpeed; this.maxHp=config.maxHp+(player.level*15); this.hp=this.maxHp;
                this.expReward=config.expReward+(player.level*5); this.projectileDamage=config.projectileDamage+(player.level*.5);
                this.shootInterval=config.shootInterval - (player.level*20); this.lastShotTime=Date.now();
                this.state="descending"; this.settleHeight = canvas.height * (0.3 + Math.random() * 0.4);
                this.statusEffects={fire:{endTime:0,damage:0,lastTick:0},ice:{endTime:0},poison:{endTime:0,damage:0,lastTick:0},electric:{endTime:0}};
                this.idealDistance = config.idealDistance; this.retreatDistance = config.retreatDistance; this.isEscaping = false; this.escapeEndTime = 0;
            }
            draw() { ctx.save();if(this.statusEffects.ice.endTime>Date.now())ctx.filter='saturate(0.3) brightness(1.5)';if(this.statusEffects.electric.endTime>Date.now()&&Date.now()%100<50)ctx.filter='brightness(2)';ctx.fillStyle=this.color;ctx.fillRect(this.x,this.y,this.width,this.height);ctx.restore();const a=this.width,b=5,c=this.y-b-2;ctx.fillStyle="#333";ctx.fillRect(this.x,c,a,b);ctx.fillStyle="#dc3545";ctx.fillRect(this.x,c,a*(this.hp/this.maxHp),b) }
            takeDamage(damage,isCrit=false,isHitKill=false){this.hp-=damage;player.overloadCharge+=damage;damageNumbers.push({value:isHitKill?'INSTA-KILL!':Math.round(damage),x:this.x+this.width/2,y:this.y,creationTime:Date.now(),color:isHitKill?'#B22222':'white',isCrit:isCrit||isHitKill})}
            applyStatusEffect(element,duration,value){const now=Date.now();this.statusEffects[element].endTime=now+duration;if(value)this.statusEffects[element].damage=value}
            updateStatusEffects(){const now=Date.now();const fire=this.statusEffects.fire;if(fire.endTime>now&&now>fire.lastTick+1e3){this.takeDamage(fire.damage);fire.lastTick=now}const poison=this.statusEffects.poison;if(poison.endTime>now&&now>poison.lastTick+1e3){this.takeDamage(poison.damage);poison.lastTick=now}this.speed=this.statusEffects.ice.endTime>now?this.baseSpeed*.5:this.baseSpeed}
            update(player, projectiles) {
                this.updateStatusEffects();
                if (this.statusEffects.electric.endTime > Date.now()) return;
                if (this.state === "descending"){ this.y += 2; if (this.y >= this.settleHeight) { this.y = this.settleHeight; this.state = "attacking"; } }
                else if (this.state === "attacking") { this.performAttackBehavior(player, projectiles); }
                this.y = Math.min(this.y, PLATFORM_Y_LEVEL - this.height);
                this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
            }
            performAttackBehavior(player, projectiles) {
                let moveX = 0, moveY = 0; const now = Date.now();
                if (this.isEscaping && now < this.escapeEndTime) {
                    const angleToCenter = Math.atan2(canvas.height / 2 - this.y, canvas.width / 2 - this.x);
                    moveX += Math.cos(angleToCenter) * this.speed * 1.5;
                } else {
                    this.isEscaping = false;
                    const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
                    const angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
                    if (distToPlayer > this.idealDistance) { moveX += Math.cos(angleToPlayer) * this.speed; moveY += Math.sin(angleToPlayer) * this.speed; }
                    else if (distToPlayer < this.retreatDistance) { moveX -= Math.cos(angleToPlayer) * this.speed; moveY -= Math.sin(angleToPlayer) * this.speed; }
                    for (const proj of projectiles) {
                        const distToProj = Math.hypot(proj.x - this.x, proj.y - this.y);
                        if (distToProj < 120) {
                            const angleFromProj = Math.atan2(this.y - proj.y, this.x - proj.x);
                            const baseDodgeForce = 0.08;
let dodgeScale = 1;
if (player.level <= 10) {
    dodgeScale = 0.3;
} else if (player.level < 50) {
    dodgeScale = 0.3 + 0.7 * ((player.level - 10) / 40);
}
const dodgeForce = (120 - distToProj) * baseDodgeForce * dodgeScale;
                            moveX += Math.cos(angleFromProj) * dodgeForce; moveY += Math.sin(angleFromProj) * dodgeForce;
                        }
                    }
                }
                this.x += moveX; this.y += moveY;
                if (!this.isEscaping && ((this.x <= 0 && moveX < 0) || (this.x + this.width >= canvas.width && moveX > 0))) { this.isEscaping = true; this.escapeEndTime = now + 1500; }
                this.shoot(player);
            }
            shoot(target) { const now=Date.now();if(now-this.lastShotTime>this.shootInterval){const startX=this.x+this.width/2,startY=this.y+this.height/2;const dx=target.x+target.width/2-startX,dy=target.y+target.height/2-startY;enemyProjectiles.push(new Projectile({x:startX,y:startY,dx,dy,speed:4,damage:this.projectileDamage,radius:5}));this.lastShotTime=now} }
        }
        class MOB extends BaseEnemy{constructor(config){super({...config,width:35,height:35,color:"#e91e63",speed:1.5,maxHp:30,expReward:10,projectileDamage:5,shootInterval:2800,idealDistance:300,retreatDistance:150})}}
        class MOBTANK extends BaseEnemy{constructor(config){super({...config,width:55,height:55,color:"#673ab7",speed:0.6,maxHp:100,expReward:25,projectileDamage:12,shootInterval:4500,idealDistance:250,retreatDistance:100});this.maxShieldHp=50+(player.level*20);this.shieldHp=this.maxShieldHp}takeDamage(a,b,c){if(this.shieldHp>0){this.shieldHp-=a;damageNumbers.push({value:Math.round(a),x:this.x+this.width/2,y:this.y,creationTime:Date.now(),color:'#00e6ff',isCrit:b||c});if(this.shieldHp<0)this.hp+=this.shieldHp;this.shieldHp=0}else super.takeDamage(a,b,c)}draw(){super.draw();if(this.shieldHp>0){ctx.beginPath();ctx.arc(this.x+this.width/2,this.y+this.height/2,this.width/2+5,0,2*Math.PI);ctx.strokeStyle=`rgba(0,230,255,${.3+.7*(this.shieldHp/this.maxShieldHp)})`;ctx.lineWidth=3;ctx.stroke();ctx.closePath()}}}
        class MOBSPEED extends BaseEnemy{constructor(config){super({...config,width:30,height:30,color:"#ff9800",speed:2.5,maxHp:20,expReward:15,projectileDamage:3,shootInterval:1800,idealDistance:450,retreatDistance:300})}}
        class BossEnemy extends BaseEnemy{
            constructor(config){
                super({...config,width:150,height:150,color:"#b80f0a",speed:1,maxHp:3e3,expReward:1e3,projectileDamage:20,shootInterval:1800,idealDistance:Infinity,retreatDistance:0});
                this.isEnraged = false; this.lastConeAttackTime = 0; this.coneAttackCooldown = 6000;
            }
            update(player, projectiles) {
                super.update(player, projectiles);
                if (!this.isEnraged && this.hp < this.maxHp * 0.5) { this.isEnraged = true; this.baseSpeed *= 1.3; this.projectileDamage *= 1.3; this.color = '#ff4500'; triggerScreenShake(15, 500); }
            }
            performAttackBehavior(player) {
                this.x += this.speed; if (this.x < 0 || this.x + this.width > canvas.width) { this.speed *= -1; }
                this.shoot(player);
                const now = Date.now();
                if (now > this.lastConeAttackTime + this.coneAttackCooldown) { this.fireConeAttack(player); this.lastConeAttackTime = now; }
            }
            fireConeAttack(target) {
                const startX=this.x+this.width/2,startY=this.y+this.height/2;const angleToPlayer=Math.atan2(target.y+target.height/2-startY,target.x+target.width/2-startX);const coneSpread=Math.PI/8;
                for(let i=0;i<5;i++){const angle=angleToPlayer-coneSpread/2+(coneSpread/4)*i;const dx=Math.cos(angle),dy=Math.sin(angle);enemyProjectiles.push(new Projectile({x:startX,y:startY,dx,dy,speed:6,damage:this.projectileDamage*.7,radius:7}));}
            }
        }
        
        // --- CORE SYSTEMS ---
        function getWeightedRarity() { const roll = Math.random() * 100; if (roll < 50) return 'Common'; if (roll < 80) return 'Rare'; if (roll < 90) return 'Epic'; if (roll < 95) return 'Legendary'; return 'Common'; }
        function generatePowerUpChoices(numChoices) {
            const tempChoices = []; const chosenIDs = new Set(); const rarityColors = {'Common':'#B0B0B0','Rare':'#7CFC00','Epic':'#9370DB','Legendary':'#FFA500','Mythic':'#B22222'};
            const availablePowerups = powerUpPool.filter(p => !((p.id==='thunderstrike'&&player.hasThunderstrike) || (p.id==='double_shot'&&player.hasDoubleShot) || (p.id==='hitkill'&&player.hasHitKill)));
            while(tempChoices.length < numChoices && availablePowerups.length > 0) {
                const rarity = getWeightedRarity();
                const possible = availablePowerups.filter(p => p.generate().rarity === rarity && !chosenIDs.has(p.id));
                if (possible.length > 0) { const choice = possible[Math.floor(Math.random() * possible.length)]; chosenIDs.add(choice.id); tempChoices.push({...choice, rarity, color: rarityColors[rarity]}); }
            }
            if (!player.hasHitKill && Math.random() < 0.002) { const mythicPowerUp = powerUpPool.find(p => p.id === 'hitkill'); const choice = {...mythicPowerUp, rarity: 'Mythic', color: rarityColors['Mythic']}; if (tempChoices.length >= numChoices) { tempChoices[0] = choice; } else { tempChoices.push(choice); } }
            currentPowerUpChoices.push(...tempChoices);
        }
        function handleShooting() {
            let tempAttackSpeedMultiplier=Date.now()<player.comboBuffEndTime?1.5:1;if(player.isOverloaded)tempAttackSpeedMultiplier*=2;const shootCooldown=BASE_SHOOT_COOLDOWN/(player.attackSpeedMultiplier*tempAttackSpeedMultiplier);if(isMouseDown&&!isGameOver){const now=Date.now();if(now-lastShotTime>shootCooldown){const startX=player.x+player.width/2,startY=player.y+player.height/2;let dx=mouse.x-startX,dy=mouse.y-startY;let isCrit=Math.random()<player.critChance;let tempDamageMultiplier=player.isOverloaded?1.5:1;let damage=BASE_PLAYER_PROJECTILE_DAMAGE*player.damageMultiplier*tempDamageMultiplier;if(isCrit){damage*=player.critDamageMultiplier}const createProjectile=(px,py)=>{playerProjectiles.push(new Projectile({x:px,y:py,dx,dy,speed:9,damage,isCrit,element:player.currentElement,radius:5}))};if(player.hasDoubleShot){const perpX=-dy/Math.hypot(dx,dy),perpY=dx/Math.hypot(dx,dy);createProjectile(startX+perpX*15,startY+perpY*15);createProjectile(startX-perpX*15,startY-perpY*15)}else{createProjectile(startX,startY)}lastShotTime=now}}
        }
        function handleCollisions() {
            for(let i=playerProjectiles.length-1;i>=0;i--){const p=playerProjectiles[i];if(!p)continue;for(let j=enemies.length-1;j>=0;j--){const e=enemies[j];if(p.x>e.x&&p.x<e.x+e.width&&p.y>e.y&&p.y<e.y+e.height){if(player.hasHitKill&&Math.random()<.01){e instanceof BossEnemy?e.takeDamage(e.maxHp*.25,true):e.takeDamage(e.hp,false,true)}else{e.takeDamage(p.damage,p.isCrit)}
            if(p.element!=='none'&&player.skills.trees[p.element].level>0){const level=player.skills.trees[p.element].level;if(p.element==='fire')e.applyStatusEffect('fire',2000+level*500,p.damage*(.1+level*.05));else if(p.element==='ice')e.applyStatusEffect('ice',1500+level*500);else if(p.element==='poison')e.applyStatusEffect('poison',3000+level*1000,p.damage*(.05+level*.03));else if(p.element==='electric'&&Math.random()<(0.1+level*.05))e.applyStatusEffect('electric',300+level*100)}
            playerProjectiles.splice(i,1);if(e.hp<=0){player.addExp(e.expReward);player.comboKills++;player.lastComboKillTime=Date.now();if(player.comboKills>0&&player.comboKills%5===0){player.comboBuffEndTime=Date.now()+5e3}if(e instanceof BossEnemy){isBossActive=false;level10BossDefeated=true;triggerScreenShake(20,1e3)}enemies.splice(j,1)}break}}}
            for(let i=enemyProjectiles.length-1;i>=0;i--){const p=enemyProjectiles[i];if(!p)continue;if(p.x>player.x&&p.x<player.x+player.width&&p.y>player.y&&p.y<player.y+player.height){player.takeDamage(p.damage);enemyProjectiles.splice(i,1)}}
            for(const bolt of thunderbolts){if(bolt.state!=='striking'||bolt.hasDealtDamage)continue;for(let j=enemies.length-1;j>=0;j--){const enemy=enemies[j];if(enemy.x+enemy.width>bolt.x-bolt.width/2&&enemy.x<bolt.x+bolt.width/2){if(enemy instanceof BossEnemy){const damage=enemy.maxHp*(.1+(player.damageMultiplier-1)*.02);enemy.takeDamage(damage,true)}else{player.addExp(enemy.expReward);enemies.splice(j,1)}}}bolt.hasDealtDamage=true}
        }
        function updatePlayerSystems(){const now=Date.now();if(now>player.lastComboKillTime+COMBO_TIMEOUT)player.comboKills=0;if(now>player.overloadEndTime){if(player.isOverloaded)player.overloadCharge=0;player.isOverloaded=false}if(!player.isOverloaded&&player.overloadCharge>=player.maxOverloadCharge){player.isOverloaded=true;player.overloadEndTime=now+1e4;triggerScreenShake(12,500)}}
        
        // --- SKILL TREE UI ---
        const skillTreeContainer=document.getElementById('skill-tree-container'),skillPointsDisplay=document.getElementById('skill-points-display');
        const skillTreeDefinitions={fire:{name:'Fire',icon:'🔥',desc:l=>`Burn deals ${10+l*5}% of hit damage over ${2+l*.5}s.`},ice:{name:'Ice',icon:'❄️',desc:l=>`Slows enemies by 50% for ${1.5+l*.5}s.`},poison:{name:'Poison',icon:'☣️',desc:l=>`Poisons for ${5+l*3}% total hit damage over ${3+l}s.`},electric:{name:'Electric',icon:'⚡',desc:l=>`${10+l*5}% chance to stun for ${.3+l*.1}s.`}};
        function populateSkillTrees(){skillTreeContainer.innerHTML='';for(const key in skillTreeDefinitions){const tree=skillTreeDefinitions[key];const treeDiv=document.createElement('div');treeDiv.className=`skill-tree skill-tree-${key}`;treeDiv.innerHTML=`<h3>${tree.icon} ${tree.name}</h3><div class="skill-level-indicator" id="level-indicator-${key}"></div><div class="skill-desc" id="desc-${key}"></div><button id="invest-${key}" class="skill-invest-btn">Invest</button><button id="equip-${key}" class="skill-equip-btn">Equip</button>`;skillTreeContainer.appendChild(treeDiv);document.getElementById(`invest-${key}`).addEventListener('click',()=>investSkillPoint(key));document.getElementById(`equip-${key}`).addEventListener('click',()=>equipElement(key))}}
        function updateSkillTreeUI(){skillPointsDisplay.textContent=`Skill Points Available: ${player.skills.skillPoints}`;for(const key in skillTreeDefinitions){const treeData=player.skills.trees[key];document.getElementById(`level-indicator-${key}`).textContent='●'.repeat(treeData.level).padEnd(10,'○');document.getElementById(`desc-${key}`).textContent=skillTreeDefinitions[key].desc(treeData.level);const investBtn=document.getElementById(`invest-${key}`);investBtn.disabled=player.skills.skillPoints===0||(!treeData.unlocked&&player.skills.unlockedTreeCount>=2);investBtn.textContent=treeData.unlocked?"Invest Point":player.skills.unlockedTreeCount<2?"Unlock & Invest":"Locked";const equipBtn=document.getElementById(`equip-${key}`);equipBtn.disabled=!treeData.unlocked;equipBtn.classList.toggle('active',player.currentElement===key)}}
        function investSkillPoint(key){if(player.skills.skillPoints>0){const tree=player.skills.trees[key];if(!tree.unlocked){if(player.skills.unlockedTreeCount<2){tree.unlocked=true;player.skills.unlockedTreeCount++}else return}player.skills.skillPoints--;tree.level++;equipElement(key)}updateSkillTreeUI()}
        function equipElement(key){if(player.skills.trees[key].unlocked){player.currentElement=key;updateSkillTreeUI()}}
        function toggleSkillTree(){isSkillTreeOpen=!isSkillTreeOpen;document.getElementById('skillTreePanel').style.display=isSkillTreeOpen?'flex':'none';if(isSkillTreeOpen)updateSkillTreeUI()}
        
        // --- GAME MANAGEMENT ---
        function resetGame(){player.level=1;player.exp=0;player.expToNextLevel=100;player.maxHp=BASE_PLAYER_MAX_HP;player.hp=BASE_PLAYER_MAX_HP;player.x=canvas.width/2-player.width/2;player.y=canvas.height-player.height;player.isInvulnerable=false;player.invulnerabilityCooldownEndTime=0;player.damageMultiplier=1;player.expMultiplier=1;player.attackSpeedMultiplier=1;player.hpMultiplier=1;player.critChance=0;player.critDamageMultiplier=2;player.hasThunderstrike=false;player.hasDoubleShot=false;player.hasHitKill=false;player.skills={skillPoints:0,unlockedTreeCount:0,trees:{fire:{level:0,unlocked:false},ice:{level:0,unlocked:false},poison:{level:0,unlocked:false},electric:{level:0,unlocked:false}}};player.currentElement='none';player.comboKills=0;player.lastComboKillTime=0;player.comboBuffEndTime=0;player.overloadCharge=0;player.isOverloaded=false;player.overloadEndTime=0;enemies=[];playerProjectiles=[];enemyProjectiles=[];thunderbolts=[];damageNumbers=[];isGameOver=false;isBossActive=false;level10BossDefeated=false;lastEnemySpawnTime=0;lastThunderstrikeTime=0;isChoosingPowerUp=false;currentPowerUpChoices=[];isSkillTreeOpen=false;document.getElementById('skillTreePanel').style.display='none'}
        function handleResize(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;PLATFORM_Y_LEVEL=canvas.height*0.75;if(!isGameOver&&player){if(player.y+player.height>canvas.height)player.y=canvas.height-player.height;if(player.x+player.width>canvas.width)player.x=canvas.width-player.width}}
        
        // --- SCENE & DRAWING ---
        function drawScene(){player.draw();enemies.forEach(e=>e.draw());[...playerProjectiles,...enemyProjectiles,...thunderbolts].forEach(p=>p.draw());}
        function drawDamageNumbers() {ctx.textAlign="center";damageNumbers.forEach(d=>{const e=Date.now()-d.creationTime;const a=1-e/1e3,y=-e*.05;if(d.isCrit){const f=typeof d.value==='string'?28:24;ctx.font=`bold ${f}px 'Courier New', monospace`;ctx.fillStyle=`rgba(${d.color==='#B22222'?'178,34,34':'255,255,0'}, ${a})`;ctx.fillText(d.value+(typeof d.value==='number'?'!':''),d.x,d.y+y)}else{ctx.font="bold 20px 'Courier New', monospace";ctx.fillStyle=`rgba(255,255,255, ${a})`;ctx.fillText(d.value,d.x,d.y+y)}});ctx.textAlign="left";}
        function drawHUD() { ctx.font="18px 'Courier New', Courier, monospace";ctx.fillStyle="white";ctx.fillText(`Level: ${player.level}`,10,30);ctx.fillStyle="#333";ctx.fillRect(10,40,200,20);ctx.fillStyle="#dc3545";ctx.fillRect(10,40,200*(player.hp/player.maxHp),20);ctx.fillStyle="white";ctx.fillText(`${Math.ceil(player.hp)} / ${player.maxHp}`,15,56);ctx.fillStyle="#333";ctx.fillRect(10,70,200,15);ctx.fillStyle="#007bff";ctx.fillRect(10,70,200*(player.exp/player.expToNextLevel),15);ctx.fillStyle="white";ctx.fillText(`${player.exp} / ${player.expToNextLevel}`,15,83);ctx.fillStyle="#333";ctx.fillRect(10,95,200,10);ctx.fillStyle=player.isOverloaded?"#ff0000":"#ff8c00";ctx.fillRect(10,95,200*(player.overloadCharge/player.maxOverloadCharge),10);let a=120;ctx.font="bold 18px 'Courier New', Courier, monospace";ctx.fillStyle="cyan";ctx.fillText(`Skill Points: ${player.skills.skillPoints}`,10,a);a+=25;if(player.comboKills>1){ctx.font="bold 22px 'Courier New'";ctx.fillStyle="orange";ctx.fillText(`COMBO x${player.comboKills}`,10,a);a+=25}if(Date.now()<player.comboBuffEndTime){ctx.font="bold 18px 'Courier New'";ctx.fillStyle="#ff4500";ctx.fillText(`COMBO FURY!`,10,a);a+=25}if(player.isOverloaded){ctx.font="bold 24px 'Courier New'";ctx.fillStyle="#ff0000";ctx.fillText(`OVERLOAD ACTIVE!`,10,a)} }
        function drawPowerUpScreen() { ctx.fillStyle="rgba(0,0,0,0.8)";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle="white";ctx.font="40px 'Courier New', Courier, monospace";ctx.textAlign="center";ctx.fillText("LEVEL UP! CHOOSE AN UPGRADE",canvas.width/2,canvas.height/4-20);const cardWidth=320,cardHeight=200,gap=50,totalWidth=cardWidth*currentPowerUpChoices.length+gap*(currentPowerUpChoices.length-1);const startX=(canvas.width-totalWidth)/2,cardY=canvas.height/2-cardHeight/2;currentPowerUpChoices.forEach((powerUp,index)=>{const cardX=startX+index*(cardWidth+gap);powerUp.rect={x:cardX,y:cardY,width:cardWidth,height:cardHeight};ctx.fillStyle="#1a1a1a";ctx.fillRect(cardX,cardY,cardWidth,cardHeight);ctx.strokeStyle=powerUp.color;ctx.lineWidth=4;ctx.strokeRect(cardX,cardY,cardWidth,cardHeight);ctx.font="40px 'Courier New', Courier, monospace";ctx.textAlign="left";ctx.fillText(powerUp.icon,cardX+20,cardY+55);ctx.font="24px 'Courier New', Courier, monospace";ctx.fillStyle="white";ctx.fillText(powerUp.title,cardX+80,cardY+50);ctx.font="18px 'Courier New', Courier, monospace";ctx.fillStyle=powerUp.color;ctx.fillText(powerUp.rarity.toUpperCase(),cardX+80,cardY+80);ctx.fillStyle="#B0B0B0";ctx.font="16px 'Courier New', Courier, monospace";let description;try{description=powerUp.description(powerUp.value)}catch(err){description=powerUp.description()};const words=description.split(" ");let line="",y=cardY+120;for(let n=0;n<words.length;n++){const testLine=line+words[n]+" ";const testWidth=ctx.measureText(testLine).width;if(testWidth>cardWidth-40&&n>0){ctx.fillText(line,cardX+20,y);line=words[n]+" ";y+=20}else{line=testLine}}ctx.fillText(line,cardX+20,y)});ctx.textAlign="left"}
        function drawGameOver() {ctx.fillStyle="rgba(0,0,0,0.7)";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle="white";ctx.font="50px 'Courier New', Courier, monospace";ctx.textAlign="center";ctx.fillText("GAME OVER",canvas.width/2,canvas.height/2-40);ctx.font="24px 'Courier New', Courier, monospace";ctx.fillText(`You reached Level ${player.level}`,canvas.width/2,canvas.height/2);ctx.font="20px 'Courier New', Courier, monospace";ctx.fillText("Press 'R' to Restart",canvas.width/2,canvas.height/2+50);ctx.textAlign="left"}
        function updateEntities() { updatePlayerSystems(); player.update(); enemies.forEach(e => e.update(player, playerProjectiles)); [...playerProjectiles, ...enemyProjectiles, ...thunderbolts].forEach(p => p.update()); }
        function handlePowerUpClick(e) {const b=canvas.getBoundingClientRect(),c=e.clientX-b.left,d=e.clientY-b.top;currentPowerUpChoices.forEach(g=>{if(g.rect&&c>g.rect.x&&c<g.rect.x+g.rect.width&&d>g.rect.y&&d<g.rect.y+g.rect.height){g.applyEffect(player,g.value);isChoosingPowerUp=false;currentPowerUpChoices=[]}})}
        function handleSpawning(){
            if (player.level >= BOSS_SPAWN_LEVEL && !level10BossDefeated && !isBossActive) { enemies = [new BossEnemy({x: canvas.width / 2 - 75})]; isBossActive = true; return; }
            if (isBossActive) return;
            const maxEnemies = player.level <= 20 ? 5 + Math.floor((player.level - 1) / 5) * 2 : 13;
            if (enemies.length >= maxEnemies) return;
            const now = Date.now();
            const spawnCooldown = Math.max(400, 3000 - player.level * 20);
            if (now - lastEnemySpawnTime < spawnCooldown) return;
            const rand = Math.random();
            let EnemyClass;
            if (player.level <= 5) { EnemyClass = MOB; } 
            else if (player.level <= 10) { EnemyClass = rand < 0.8 ? MOB : MOBTANK; } 
            else { if (rand < 0.5) EnemyClass = MOB; else if (rand < 0.8) EnemyClass = MOBTANK; else EnemyClass = MOBSPEED; }
            const enemyData = { MOB:{width:35}, MOBTANK:{width:55}, MOBSPEED:{width:30} };
            const enemyWidth = enemyData[EnemyClass.name].width;
            let spawnX, isOverlapping, tries = 0;
            do {
                isOverlapping = false;
                spawnX = Math.random() * (canvas.width - enemyWidth);
                for (const e of enemies) { if (spawnX < e.x + e.width + 10 && spawnX + enemyWidth > e.x - 10) { isOverlapping = true; break; } }
                tries++;
            } while (isOverlapping && tries < 20);
            if (!isOverlapping) { enemies.push(new EnemyClass({x: spawnX})); lastEnemySpawnTime = now; }
        }
        
        // --- MAIN GAME LOOP ---
        function gameLoop() {
            requestAnimationFrame(gameLoop);
            const now = Date.now(); ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (isGameOver) { drawGameOver(); return; }
            if (isChoosingPowerUp || isSkillTreeOpen) { ctx.save(); drawScene(); drawDamageNumbers(); ctx.restore(); if (isChoosingPowerUp) drawPowerUpScreen(); drawHUD(); return; }
            handleSpawning(); handleShooting(); handleThunderstrike(); updateEntities(); handleCollisions();
            playerProjectiles=playerProjectiles.filter(p=>p.x>-200&&p.x<canvas.width+200&&p.y>-200&&p.y<canvas.height+200);enemyProjectiles=enemyProjectiles.filter(p=>p.x>-10&&p.x<canvas.width+10&&p.y>-10&&p.y<canvas.height+10);thunderbolts=thunderbolts.filter(t=>now - t.creationTime < t.totalDuration);damageNumbers=damageNumbers.filter(d=>now-d.creationTime<1e3);
            ctx.save();
            if (now < screenShake.endTime) { const dx = (Math.random() - 0.5) * 2 * screenShake.intensity; const dy = (Math.random() - 0.5) * 2 * screenShake.intensity; ctx.translate(dx, dy); }
            drawScene();
            ctx.restore();
            drawDamageNumbers(); drawHUD();
        }
        
        // --- EVENT LISTENERS & INITIALIZATION ---
        function triggerScreenShake(intensity, duration) { screenShake.intensity = intensity; screenShake.endTime = Date.now() + duration; }
        function handleThunderstrike() { if (!player.hasThunderstrike) return; if (Date.now() - lastThunderstrikeTime > 5000) { thunderbolts.push(new Thunderbolt(Math.random() * canvas.width)); thunderbolts.push(new Thunderbolt(Math.random() * canvas.width)); lastThunderstrikeTime = Date.now(); } }
        window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; if(e.key.toLowerCase() === 'k') toggleSkillTree(); if (e.key === ' ' && !isGameOver && !isChoosingPowerUp && !isSkillTreeOpen) player.jump(); if (isGameOver && e.key.toLowerCase() === 'r') resetGame(); });
        window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });
        canvas.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
        canvas.addEventListener('mousedown', (e) => { if (e.button !== 0 || isSkillTreeOpen) return; if (isChoosingPowerUp) { handlePowerUpClick(e); return; } isMouseDown = true; });
        window.addEventListener('mouseup', (e) => { if (e.button === 0) isMouseDown = false; });
        window.addEventListener('resize', handleResize);
        document.getElementById('skillTreeButton').addEventListener('click', toggleSkillTree);
        document.getElementById('skillTreeCloseButton').addEventListener('click', toggleSkillTree);

        populateSkillTrees();
        handleResize();
        resetGame();
        gameLoop();
