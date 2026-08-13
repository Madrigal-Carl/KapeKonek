import bcrypt from "bcrypt";
import User from "../models/user.model.js";

const DEFAULT_PASSWORD = "KapeKonek123";
const SALT_ROUNDS = 12;

// Order matters: farmers (by creation order) are matched to associations in
// farmerVerification.seeder.js + farm.seeder.js via the same filter order,
// and managers (by creation order) are matched to associations in
// association.seeder.js.
const USERS_TO_SEED = [
    { firstName: "Juan", lastName: "Kaluppa", username: "jkaluppa", email: "kaluppa@kapekonek.ph", contactNumber: "09170000001", address: "Boac, Marinduque", role: "kaluppa" },
    { firstName: "Maria", lastName: "Dti", username: "mdti", email: "dti@kapekonek.ph", contactNumber: "09170000002", address: "Boac, Marinduque", role: "dti" },
    { firstName: "Carlos", lastName: "Manager", username: "cmanager", email: "carlos@kapekonek.ph", contactNumber: "09170000003", address: "Boac, Marinduque", role: "manager" },
    { firstName: "Ana", lastName: "Manager", username: "amanager", email: "ana@kapekonek.ph", contactNumber: "09170000004", address: "Gasan, Marinduque", role: "manager" },
    { firstName: "Ramon", lastName: "Dela Cruz", username: "rdelacruz", email: "ramon@kapekonek.ph", contactNumber: "09170000005", address: "Agot, Boac, Marinduque", role: "farmer" },
    { firstName: "Lourdes", lastName: "Mendoza", username: "lmendoza", email: "lourdes@kapekonek.ph", contactNumber: "09170000006", address: "Isok, Boac, Marinduque", role: "farmer" },
    { firstName: "Pedro", lastName: "Santos", username: "psantos", email: "pedro@kapekonek.ph", contactNumber: "09170000007", address: "Boi, Boac, Marinduque", role: "farmer" },
    { firstName: "Elena", lastName: "Reyes", username: "ereyes", email: "elena@kapekonek.ph", contactNumber: "09170000008", address: "Poctoy, Boac, Marinduque", role: "farmer" },
    { firstName: "Miguel", lastName: "Torres", username: "mtorres", email: "miguel@kapekonek.ph", contactNumber: "09170000009", address: "Balimbing, Boac, Marinduque", role: "farmer" },
    { firstName: "Rosa", lastName: "Villanueva", username: "rvillanueva", email: "rosa@kapekonek.ph", contactNumber: "09170000010", address: "Laylay, Boac, Marinduque", role: "farmer" },
    { firstName: "Diane", lastName: "Buyer", username: "dbuyer", email: "diane@kapekonek.ph", contactNumber: "09170000011", address: "Boac, Marinduque", role: "buyer" },
];

const getFullName = (user) =>
    [user.firstName, user.middleName, user.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

export const wipeUsers = async () => {
    const result = await User.deleteMany({});
    console.log(`  Wiped ${result.deletedCount} user(s).`);
};

export const seedUsers = async () => {
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
    const users = [];

    for (const userData of USERS_TO_SEED) {
        const user = await User.create({
            firstName: userData.firstName,
            middleName: userData.middleName ?? "",
            lastName: userData.lastName,
            username: userData.username,
            email: userData.email,
            contactNumber: userData.contactNumber,
            address: userData.address,
            password: hashedPassword,
            isVerified: true,
            role: userData.role,
        });

        users.push(user);
        console.log(
            `  Seeded: ${getFullName(user)} <${user.email}> (${user.role})`,
        );
    }

    return { users };
};
