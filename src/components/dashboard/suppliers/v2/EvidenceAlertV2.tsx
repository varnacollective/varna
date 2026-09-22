"use client";

import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

interface EvidenceAlertV2Props {
  showAlert?: boolean;
  alertTitle?: string;
  alertBody?: string;
}

