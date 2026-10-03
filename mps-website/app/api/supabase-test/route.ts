import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
    const { error } = await supabase.auth.getSession();

    if (error) {
        return NextResponse.json(
            {
                success: false,
                message: "Supabase connection failed",
                error: error.message,
            },
            { status: 500 }
        );
    }

    return NextResponse.json({
        success: true,
        message: "Supabase connection successful",
    });
}