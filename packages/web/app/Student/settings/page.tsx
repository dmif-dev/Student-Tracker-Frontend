"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

const settingsSchema = z.object({
    username: z.string().min(2).max(50),
    email: z.string().email(),
    notifications: z.boolean().default(false).optional(),
    darkMode: z.boolean().default(false).optional(),
});

export default function SettingsPage() {
    const { toast } = useToast();
    const form = useForm<z.infer<typeof settingsSchema>>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            username: "Jdoe123",
            email: "jdoe@example.com",
            notifications: true,
            darkMode: false,
        },
    });

    function onSubmit(values: z.infer<typeof settingsSchema>) {
        console.log(values);
        toast({
            title: "Settings Saved",
            description: "Your preferences have been updated.",
        });
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-2">Update your profile and application preferences.</p>
            </div>

            <div className="bg-card border rounded-xl p-6 shadow-sm">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Simple Profile Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Profile</h3>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Username</label>
                            <Input {...form.register("username")} />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input {...form.register("email")} />
                        </div>
                    </div>

                    <div className="h-px bg-border" />

                    {/* Preferences Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Preferences</h3>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <label className="text-base font-medium">Email Notifications</label>
                                <p className="text-sm text-muted-foreground">Receive weekly reports via email.</p>
                            </div>
                            <Switch
                                checked={form.watch("notifications")}
                                onCheckedChange={(checked: boolean) => form.setValue("notifications", checked)}
                            />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <label className="text-base font-medium">Dark Mode</label>
                                <p className="text-sm text-muted-foreground">Enable dark theme for the interface.</p>
                            </div>
                            <Switch
                                checked={form.watch("darkMode")}
                                onCheckedChange={(checked: boolean) => form.setValue("darkMode", checked)}
                            />
                        </div>
                    </div>

                    <Button type="submit">Safe Changes</Button>
                </form>
            </div>
        </div>
    );
}
