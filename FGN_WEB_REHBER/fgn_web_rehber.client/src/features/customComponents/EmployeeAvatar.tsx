import { Avatar } from "@mui/material";
import { useState } from "react";
import { getPhotoUrl } from "../../api/requests";

interface Props {
    fotoUrl?: string;
    name: string;
    size?: number;
    sx?: object;
    onClick?: () => void;
    children?: React.ReactNode;
}

const initials = (name: string) =>
    name.split(" ").filter(Boolean).slice(0, 2)
        .map((w) => w[0]?.toLocaleUpperCase("tr-TR")).join("");

export function EmployeeAvatar({ fotoUrl, name, size = 40, sx, onClick, children }: Props) {
    const [imgError, setImgError] = useState(false);
    const photoUrl = !imgError ? getPhotoUrl(fotoUrl) : undefined;

    return (
        <Avatar
            sx={{ width: size, height: size, bgcolor: "#111111", fontSize: size * 0.34, cursor: onClick ? "pointer" : "default", ...sx }}
            onClick={onClick}
        >
            {photoUrl ? (
                <img
                    src={photoUrl}
                    alt={name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={() => setImgError(true)}
                />
            ) : (children ?? initials(name))}
        </Avatar>
    );
}
