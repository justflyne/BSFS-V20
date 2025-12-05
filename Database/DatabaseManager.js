const mysql = require('mysql2/promise');
const fs = require('fs');

const cache = new Map();
const clubLeadersCache = new Map();
const globalBrawlerLeadersCache = new Map();
const clubListCache = new Map();

// if u need ssl mode:

const pool = mysql.createPool({
  host: 'localhost',
  user: 'user',
  password: 'password',
  database: 'database',
  ssl: {
    ca: fs.readFileSync('/var/lib/mysql/ca.pem'),
    cert: fs.readFileSync('/var/lib/mysql/server-cert.pem'),
    key: fs.readFileSync('/var/lib/mysql/server-key.pem')
  }
});

// if u don't need ssl mode:
/*const pool = mysql.createPool({
  host: 'localhost',
  user: 'user',
  password: 'password',
  database: 'database'
});*/

pool.execute(`CREATE TABLE IF NOT EXISTS clubs (
  clubId INT PRIMARY KEY AUTO_INCREMENT,
  members JSON,
  msg JSON,
  trophies INT,
  name TEXT,
  badgeId TINYINT,
  data JSON
)`);

pool.execute(`CREATE TABLE IF NOT EXISTS accounts (
  lowID INT PRIMARY KEY AUTO_INCREMENT,
  token TEXT,
  trophies INT,
  highestTrophies INT,
  trophyRoadProgress INT,
  experience INT,
  thumbnail TINYINT,
  nameColor TINYINT,
  currencies JSON,
  tutorialState INT,
  brawlerId TINYINT,
  skinId INT,
  supportedCreator TEXT,
  name TEXT,
  clubId INT,
  clubRole TINYINT,
  status TINYINT,
  shop JSON,
  skins JSON,
  notifications JSON,
  brawlers JSON,
  skills JSON,
  lastGame TEXT,
  lastOnline TEXT,
  friends JSON,
  wins JSON
)`);

pool.execute(`CREATE TABLE IF NOT EXISTS token_lowID (
  token TEXT,
  lowID INT,
  FOREIGN KEY (lowID) REFERENCES accounts(lowID)
)`);
async function createAccount(token) {
  try {
    const brawlersArray = getBrawlerArray();
    const [rows, fields] = await pool.execute(`INSERT INTO accounts (
      token, trophies, highestTrophies, trophyRoadProgress, experience, thumbnail, nameColor, currencies, tutorialState,
      brawlerId, skinId, supportedCreator, name, clubId, clubRole, status, shop, skins,
      notifications, brawlers, skills, lastGame, lastOnline, friends, wins
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      token,
      0, // trophies
      0, // highestTrophies
      1, // TrophyRoadTier
      0, // Experience
      0, // Thumbnail
      0, // Namecolor  
      JSON.stringify({
        "gold": 99999,
        "gems": 99999,
        "starpoints": 99999,
        "tickets": 99999,
        "tokensDoublers": 99999,
        "tokens": 10000,
        "starTokens": 100
      }), // currencies     
      0, // tutorialState
      0, // BrawlerID
      0, // SkinID
      "", // AuthorCode
      "BSFS V20", // name
      0, // clubId
      1, // ClubRole
      0, // Status
      JSON.stringify([]), // shop
      JSON.stringify([]), // Skins
      JSON.stringify([]), // Notification
      JSON.stringify(brawlersArray), // brawlers
      JSON.stringify([]), // Skills
      "",//lastGame
      "",
      JSON.stringify([]), // Friends
      JSON.stringify({
        "trioWins": 9339,
        "soloWins": 9339,
        "duoWins": 9339
      }) // wins
    ]);
    
    const newAccountId = rows.insertId;
    await pool.execute(`INSERT INTO token_lowID (token, lowID) VALUES (?, ?)`, [token, newAccountId]);
    return null;
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
}

function getBrawlerArray() {
  const unlockCardsArray = Object.values(global.unlockCards);
  return Array.from({ length: unlockCardsArray.length }, (_, i) => ({
      id: i,
      cardID: unlockCardsArray[i],
      unlocked: i === 0,      
      //unlocked: 1,
      level: 0,
      points: 0,
      trophies: 0
  }));
}

async function getAccount(lowID) {

  try {
    const [rows, fields] = await pool.execute('SELECT * FROM accounts WHERE lowID = ?', [lowID]);
    if (rows.length > 0) {
      let row = rows[0];
      let brawlerTrop = row.brawlers.reduce((sum, brawler) => sum + parseInt(brawler.trophies), 0);
      if (brawlerTrop !== row.trophies) {
        row.trophies = brawlerTrop;
        await pool.execute('UPDATE accounts SET trophies = ? WHERE lowID = ?', [row.trophies, lowID]);
      }
      if(row.trophies > row.highestTrophies){
        row.highestTrophies = row.trophies;
        await pool.execute('UPDATE accounts SET highestTrophies = ? WHERE lowID = ?', [row.highestTrophies, lowID]);
      }

      return row;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error loading account:', error.message);
    throw error;
  }
}

async function getAccountToken(token) {
  const [rows, fields] = await pool.execute('SELECT * FROM token_lowID WHERE token = ?', [token]);
  if (rows.length > 0) { 
      let row = rows[0];
      return getAccount(row.lowID)
  } else {
      return null
  }
}


async function replaceValue(lowID, valueName, newValue) {
  try {
    if (valueName !== "brawlers") {
      await pool.execute(`UPDATE accounts SET ${valueName} = ? WHERE lowID = ?`, [newValue, lowID]);

      if (valueName === 'token') {
        await pool.execute(`UPDATE token_lowID SET token = ? WHERE lowID = ?`, [newValue, lowID]);
      }
    } else {
      const brawlersString = JSON.stringify(newValue);
      await pool.execute(`UPDATE accounts SET brawlers = ? WHERE lowID = ?`, [brawlersString, lowID]);
    }
  } catch (error) {
    console.error('Error updating value:', error.message);
    throw error;
  }
}

async function getLeaders() {
  const cacheKey = 'leaderboardData';
  const now = Date.now();
  try {
    if (cache.has(cacheKey)) {
      const { data, expiry } = cache.get(cacheKey);
      if (now < expiry) {
        return data;
      }
    }

    const sql = 'SELECT lowID, trophies, name, thumbnail, nameColor FROM accounts ORDER BY trophies DESC LIMIT 200';
    const [rows] = await pool.execute(sql);

    const expiry = now + 7000;
    cache.set(cacheKey, { data: rows, expiry });

    return rows;
  } catch (error) {
    logToFile(`Error fetching leaderboard data: ${error}`);
    throw error;
  }
}

async function getGlobalBrawlerLeaders(BID) {
  const cacheKey = `globalBrawlerLeaders_${BID}`;
  const now = Date.now();
  try {
    if (globalBrawlerLeadersCache.has(cacheKey)) {
      const { data, expiry } = globalBrawlerLeadersCache.get(cacheKey);
      if (now < expiry) {
        return data;
      }
    }

    const query = `
    SELECT lowID, name, thumbnail, nameColor, b.id as brawler_id, b.trophies as brawler_trophies
    FROM accounts a
    INNER JOIN JSON_TABLE(a.brawlers, "$[*]" COLUMNS (
      id TINYINT PATH "$.id",
      trophies INT PATH "$.trophies"
    )) AS b
    WHERE b.id = ?
    ORDER BY b.trophies DESC
    LIMIT 200
    `;
    const [rows] = await pool.execute(query, [BID]);

    const leadersWithPlayerInfo = rows.map(row => ({
      lowID: row.lowID,
      name: row.name,
      Thumbnail: row.Thumbnail,
      Namecolor: row.Namecolor,
      brawler: {
        id: row.brawler_id,
        trophies: row.brawler_trophies
      }
    }));

    const expiry = now + 10000;
    globalBrawlerLeadersCache.set(cacheKey, { data: leadersWithPlayerInfo, expiry });
    
    return leadersWithPlayerInfo;
  } catch (error) {
    const errorMessage = `Error getting global Brawler leaders with player info: ${error.message}`;
    logToFile(errorMessage);
    throw error;
  }
}


async function getClubLeaders() {
  const cacheKey = 'clubLeadersData';
  const now = Date.now();
  try {
    if (clubLeadersCache.has(cacheKey)) {
      const { data, expiry } = clubLeadersCache.get(cacheKey);
      if (now < expiry) {
        return data;
      }
    }

    const [rows] = await pool.execute('SELECT clubId, trophies, name, members, badgeId FROM clubs ORDER BY trophies DESC LIMIT 100');

    const expiry = now + 60000;
    clubLeadersCache.set(cacheKey, { data: rows, expiry });
    
    return rows;
  } catch (error) {
    const errorMessage = `Error getting club leaders: ${error.message}`;
    logToFile(errorMessage);
    throw error;
  }
}


async function getClubList() {
  const cacheKey = 'clubListData';
  const now = Date.now();

  try {
    if (clubListCache.has(cacheKey)) {
      const { data, expiry } = clubListCache.get(cacheKey);
      if (now < expiry) {
        return data;
      }
    }

    const [rows, fields] = await pool.execute('SELECT clubId, trophies, name, members, badgeId FROM clubs ORDER BY RAND() LIMIT 100');

    const expiry = now + 10000;
    clubListCache.set(cacheKey, { data: rows, expiry });
    
    return rows;
  } catch (error) {
    const errorMessage = `Error getting club list: ${error.message}`;
    logToFile(errorMessage);
    throw error;
  }
}

async function searchClub(name) {
  try {
    const [clubRows] = await pool.execute('SELECT * FROM clubs WHERE name = ?', [name]);

    const clubs = clubRows.map(club => {
      return club;
    });
    return clubs;
  } catch (error) {
    console.error('Error searching for clubs:', error.message);
    throw error;
  }
}

async function createClub(data) {
  try {
    const [result] = await pool.execute('INSERT INTO clubs (members, msg, trophies, name, badgeId, data) VALUES (?, ?, ?, ?, ?, ?)', [
      JSON.stringify(data.members),
      JSON.stringify([]),
      data.trophies,
      data.name,
      data.badgeId,
      JSON.stringify({
        Type: data.Type,
        Trophiesneeded: data.Trophiesneeded,
        Description: data.Description,
        FriendlyFamily: data.FriendlyFamily
      })
    ]);

    return result.insertId;
  } catch (error) {
    console.error('Error creating club:', error.message);
    throw error;
  }
}

async function getClub(clubId) {
  try {
    const [rows, fields] = await pool.execute('SELECT clubId, members, name, badgeId, msg, data FROM clubs WHERE clubId = ?', [clubId]);
    if (rows.length > 0) {
      const club = rows[0];
      
      let clubTrophies = 0;
	  
      let messages = club.msg.sort((a, b) => b.tick - a.tick);
      
      if (messages.length > 30) {
        club.msg = messages.slice(0, 30);
      }
      club.msg = club.msg.sort((a, b) => a.tick - b.tick);

      for (let plrID of club.members) {
        const player = await getAccount(plrID);
        if (player.brawlers.length <= 0) await clubDelMember(club.members, clubId, player.lowID);
        if (player.clubId !== clubId) await clubDelMember(club.members, clubId, player.lowID);
        clubTrophies += player.trophies;
      }
      if (club.trophies !== clubTrophies) {
        club.trophies = clubTrophies;
        await pool.execute('UPDATE clubs SET trophies = ? WHERE clubId = ?', [clubTrophies, clubId]);
      }
      return club;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting club:', error.message);
    throw error;
  }
}

async function getUserClub(lowID) {
  try {
    const [rows, fields] = await pool.execute('SELECT lowID, clubRole, trophies, lastOnline, status, name, thumbnail, nameColor, brawlers FROM accounts WHERE lowID = ?', [lowID]);
    if (rows.length > 0) {
      let row = rows[0];
      let brawlerTrop = row.brawlers.reduce((sum, brawler) => sum + parseInt(brawler.trophies), 0);
      if(brawlerTrop !== row.trophies){
        row.Trophies = brawlerTrop
        await pool.execute('UPDATE accounts SET trophies = ? WHERE lowID = ?', [row.trophies, lowID]);
      }
      return row;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error loading account:', error.message);
    throw error;
  }
}

async function clubUpdate(clubId, settings) {
  try {
    const [clubRows] = await pool.execute('SELECT * FROM clubs WHERE clubId = ?', [clubId]);
    if (!clubRows.length) {
      throw new Error(`Club with ID ${clubId} not found`);
    }

    const club = clubRows[0];
    const updatedClub = {
      ...club,
      name: settings.name || club.name,
      badgeId: settings.badgeId || club.badgeId,
      data: {
        Type: settings.Type || club.data.Type,
        Description: settings.Description || club.data.Description,
        Trophiesneeded: settings.Trophiesneeded || club.data.Trophiesneeded,
        FriendlyFamily: settings.FriendlyFamily || club.data.FriendlyFamily
      }
    };

    await pool.execute('UPDATE clubs SET name = ?, badgeId = ?, data = ? WHERE clubId = ?', [
      updatedClub.name,
      updatedClub.badgeId,
      updatedClub.data,
      clubId
    ]);
    return updatedClub
  } catch (error) {
    console.error('Error updating club settings:', error.message);
    throw error;
  }
}

async function clubAddMessages(messages, msgData, clubId) {
  try {
    messages.push({
      timestamp: new Date(),
      tick: messages.length + 1,
      ...msgData,
    });
    messages = messages.sort((a, b) => b.tick - a.tick);

    if (messages.length > 30) {
      messages = messages.slice(0, 30);
    }

    messages = messages.sort((a, b) => a.tick - b.tick);
    await pool.execute('UPDATE clubs SET msg = ? WHERE clubId = ?', [JSON.stringify(messages), clubId]);
    return messages;
  } catch (error) {
    console.error('Error adding message to club:', error.message);
    throw error;
  }
}

async function clubDelMember(members, clubId, plrID) {
  try {
    const memberIndex = members.indexOf(plrID);
    if (memberIndex !== -1) {
      members.splice(memberIndex, 1);
      await pool.execute('UPDATE clubs SET members = ? WHERE clubId = ?', [JSON.stringify(members), clubId]);
      if (members.length === 0) {
        await pool.execute('DELETE FROM clubs WHERE clubId = ?', [clubId]);
      }
    }
  } catch (error) {
    console.error('Error removing player from club:', error.message);
    throw error;
  }
}

async function clubAddMember(members, lowID, clubId) {
  try {
    members.push(lowID)
    await pool.execute('UPDATE clubs SET members = ? WHERE clubId = ?', [JSON.stringify(members), clubId]);
    return members;
  } catch (error) {
    console.error('Error adding player to club:', error.message);
    throw error;
  }
}

async function getCounts() {
  try {
    const [accountRows, clubRows, DAU] = await Promise.all([
      pool.execute('SELECT COUNT(*) AS count FROM accounts'),
      pool.execute('SELECT COUNT(*) AS count FROM clubs'),
      pool.execute('SELECT COUNT(*) from accounts WHERE lastOnline >= CURRENT_TIME() - INTERVAL 1 DAY')
    ]);
    const accountCount = accountRows[0][0].count;
    const clubCount = clubRows[0][0].count;
    const infodau = DAU[0][0]['COUNT(*)'];

    return { accountCount, clubCount, infodau };
  } catch (error) {
    console.error('Error getting counts:', error.message);
    throw error;
  }
}

module.exports = {
  createAccount,
  getAccount,
  getAccountToken,
  replaceValue,
  getLeaders,
  getGlobalBrawlerLeaders,
  getClubLeaders,
  getClubList,
  searchClub,
  createClub,
  getClub,
  getUserClub,
  clubUpdate,
  clubAddMessages,
  clubDelMember,
  clubAddMember,
  getCounts
};