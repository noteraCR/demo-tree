// src/data/networkGenerator.js
// --- Умный генератор имен, учитывающий пол ---

const maleFirstNames = ['Иван', 'Петр', 'Сергей', 'Дмитрий', 'Андрей', 'Константин', 'Алексей', 'Никита', 'Владимир'];
const femaleFirstNames = ['Анна', 'Ольга', 'Елена', 'Мария', 'Светлана', 'Татьяна', 'Наталья', 'Ирина', 'Екатерина'];

const maleLastNames = ['Петров', 'Сидоров', 'Воронов', 'Новиков', 'Васильев', 'Смирнов', 'Кузнецов', 'Попов', 'Лебедев', 'Иванов'];
const femaleLastNames = ['Петрова', 'Сидорова', 'Воронова', 'Новикова', 'Васильева', 'Смирнова', 'Кузнецова', 'Попова', 'Лебедева', 'Иванова'];

// Транслитерация для почты
const translit = (str) => {
    const a = {"Ё":"YO","Й":"I","Ц":"TS","У":"U","К":"K","Е":"E","Н":"N","Г":"G","Ш":"SH","Щ":"SCH","З":"Z","Х":"H","Ъ":"","Ф":"F","Ы":"Y","В":"V","А":"A","П":"P","Р":"R","О":"O","Л":"L","Д":"D","Ж":"ZH","Э":"E","Я":"Ya","Ч":"CH","С":"S","М":"M","И":"I","Т":"T","Ь":"","Б":"B","Ю":"YU", "ё":"yo","й":"i","ц":"ts","у":"u","к":"k","е":"e","н":"n","г":"g","ш":"sh","щ":"sch","з":"z","х":"h","ъ":"","ф":"f","ы":"y","в":"v","а":"a","п":"p","р":"r","о":"o","л":"l","д":"d","ж":"zh","э":"e","я":"ya","ч":"ch","с":"s","м":"m","и":"i","т":"t","ь":"","б":"b","ю":"yu"};
    return str.split('').map(char => a[char] || char).join('');
}


const getRandomNameAndEmail = () => {
    const isMale = Math.random() > 0.5;
    const firstName = isMale ? maleFirstNames[Math.floor(Math.random() * maleFirstNames.length)] : femaleFirstNames[Math.floor(Math.random() * femaleFirstNames.length)];
    const lastName = isMale ? maleLastNames[Math.floor(Math.random() * maleLastNames.length)] : femaleLastNames[Math.floor(Math.random() * femaleLastNames.length)];
    
    const fullName = `${firstName} ${lastName}`;
    const email = `${translit(firstName)}.${translit(lastName)}@example.com`.toLowerCase();

    return { fullName, email };
};

const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
let agentIdCounter = 0;

// --- Остальная часть файла networkGenerator.js остается ТОЧНО ТАКОЙ ЖЕ, как в предыдущей версии ---
// Я привожу ее ниже для полноты, чтобы ты мог просто скопировать весь файл.

const generateLevel = (currentDepth, config) => {
    if (currentDepth > config.maxDepth) return [];
    
    const childrenCount = getRandomNumber(
        config.minChildrenPerNode - currentDepth > 0 ? config.minChildrenPerNode - currentDepth : 0,
        config.maxChildrenPerNode - currentDepth > 0 ? config.maxChildrenPerNode - currentDepth : 1
    );

    const levelNodes = [];

    for (let i = 0; i < childrenCount; i++) {
        if (Math.random() < (config.branchingFactor / (currentDepth + 1))) {
            const { fullName, email } = getRandomNameAndEmail();
            const earnings = getRandomNumber(50, 5000) / (currentDepth + 1);
            const earnings30d = earnings * (0.2 + Math.random() * 0.3);

            const newNode = {
                id: `agent-gen-${agentIdCounter++}`,
                name: fullName,
                email: email,
                earnings: earnings,
                earnings30d: earnings30d,
                children: generateLevel(currentDepth + 1, config),
            };
            levelNodes.push(newNode);
        }
    }
    return levelNodes;
};

export const generateHugeNetwork = (config) => {
    const {
        initialStars = 15,
        maxDepth = 7,
        minChildrenPerNode = 1,
        maxChildrenPerNode = 5,
        branchingFactor = 0.9,
    } = config;

    agentIdCounter = 0;
    const topLevelStars = [];

    for (let i = 0; i < initialStars; i++) {
        const { fullName, email } = getRandomNameAndEmail();
        const earnings = getRandomNumber(5000, 25000);
        const earnings30d = earnings * (0.2 + Math.random() * 0.3);

        const starNode = {
            id: `agent-gen-${agentIdCounter++}`,
            // ИЗМЕНЕНИЕ: Убираем бессмысленную приписку "(Лидер)"
            name: fullName,
            email: email,
            earnings: earnings,
            earnings30d: earnings30d,
            children: generateLevel(1, { maxDepth, minChildrenPerNode, maxChildrenPerNode, branchingFactor }),
        };
        topLevelStars.push(starNode);
    }
    
    console.log(`Generated network with ${agentIdCounter} agents.`);
    return topLevelStars;
};