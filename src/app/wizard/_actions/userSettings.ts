"use server";

import { UserSettings } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { UpdateUserCurrencySchema } from "@/schema/userSetting";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function updateUserCurrency(
  currency: string
): Promise<UserSettings> {
    const parsedBody  = UpdateUserCurrencySchema.safeParse({ currency });

    if (!parsedBody.success) {
        throw new Error(parsedBody.error.message);
    }

    const user = await currentUser();
    if (!user) {
        redirect("/sign-in");
    }

    const userSettings = await prisma.userSettings.update({
        where: { userId: user.id },
        data: { currency },
    })

    return userSettings;
}
