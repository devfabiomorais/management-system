"use client";
import React, { useState, useEffect } from "react";

const FooterLayout: React.FC = () => {

    return (
        <footer className="text-center py-4">
            <p className="text-blue">
                Copyright © Grupo ComViver {new Date().getFullYear()}
            </p>
        </footer>
    );
}

export default FooterLayout;
