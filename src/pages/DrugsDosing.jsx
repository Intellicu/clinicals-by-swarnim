import React, { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search, Pill, AlertTriangle, Calculator, Shield,
  Printer, MessageCircle, Plus, Trash2, CheckCircle, Activity, Beaker, X,
  BookOpen, Star, StarOff, Upload, Download, Sparkles, Globe,
  ChevronLeft, ChevronDown, ChevronUp, Save, FolderOpen, Clock, ArrowRight, Lock, FileText
} from "lucide-react";
import DrugDetailCard from "../components/drugs/DrugDetailCard";
import RxIndicationBuilder from "../components/drugs/RxIndicationBuilder";
import FormularyMonograph from "../components/drugs/FormularyMonograph";
import IndicationPickerEngine from "../components/drugs/IndicationPickerEngine";
import FormularyCategoryStrips from "../components/drugs/FormularyCategoryStrips";
import SteroidEquivalenceEngine from "../components/drugs/SteroidEquivalenceEngine";
import SteroidSparingAgents from "../components/drugs/SteroidSparingAgents";
import IndicationPrescribeWizard from "../components/drugs/IndicationPrescribeWizard";
import EculizumabGuidance from "../components/drugs/EculizumabGuidance";
import PlasmapheresisModule from "../components/drugs/PlasmapheresisModule";
import FormularyBrowser from "../components/drugs/FormularyBrowser";
import EquipmentReference from "../components/drugs/EquipmentReference";
import { toast } from "sonner";
import { usePatient } from "../components/PatientContext";
import { FORMULARY, getFormularyDrug } from "@/lib/formulary/nephrology-drugs";