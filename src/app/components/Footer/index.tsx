"use client";
import React, { useState, useEffect } from "react";

const FooterLayout: React.FC = () => {

    return (
        <footer className="text-center py-4 bg-transparent">
            <p className="text-blue">
                <a
                    href="https://github.com/devfabiomorais"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-700"
                >
                    @devfabiomorais
                </a>{" "}
                {new Date().getFullYear()}
            </p>
        </footer>
    );
}

export default FooterLayout;
