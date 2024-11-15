import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { stopEventPropagation } from '@tldraw/tldraw'
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-dart';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-typescript';
import 'prismjs/plugins/line-numbers/prism-line-numbers.js';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';
import { auth, db } from '../../firebase'; // Add this import
import { doc, getDoc, setDoc } from "firebase/firestore"; // Add this import
import { User } from "firebase/auth"; // Add this import

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  localHtml: string;
}

const frameworks = [
  { value: 'react', label: 'React', info: 'JavaScript', rank: 1, instruction: "Implement using Shadcn components. Utilize built-in React hooks for state management and side effects.", cliCommand: "npx create-next-app@latest && npx shadcn-ui@latest init", oneLineInstruction: "Create a Next.js app with Shadcn UI components." },
  { value: 'flutter', label: 'Flutter', info: 'Dart', rank: 2, instruction: "Implement state management using Riverpod. Use Flutter Hooks for reusable stateful logic. Consider using go_router for declarative routing.", cliCommand: "flutter create my_app && flutter pub add flutter_riverpod hooks_riverpod go_router", oneLineInstruction: "Create a Flutter project with Riverpod, Hooks, and go_router." },
  { value: 'vue', label: 'Vue.js', info: 'JavaScript', rank: 3, instruction: "Use Vue 3 with Composition API and <script setup>. Implement state management with Pinia. Use Vue Router for navigation.", cliCommand: "npm init vue@latest && npm install pinia vue-router@4", oneLineInstruction: "Create a Vue 3 project with Pinia and Vue Router." },
  { value: 'svelte', label: 'Svelte', info: 'JavaScript', rank: 4, instruction: "Use SvelteKit for full-stack development. Implement state management with Svelte stores. Consider using Tailwind CSS for styling.", cliCommand: "npm create svelte@latest my-app && npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p", oneLineInstruction: "Create a SvelteKit project with Tailwind CSS integration." },
  { value: 'swiftui', label: 'SwiftUI', info: 'Swift (iOS)', rank: 5, instruction: "Use the MVVM architecture pattern. Implement dependency injection with Swift's property wrappers. Consider using Combine for reactive programming.", cliCommand: "swift package init --type executable && swift package add Combine", oneLineInstruction: "Initialize a Swift package and add Combine framework." },
  { value: 'jetpackcompose', label: 'Jetpack Compose', info: 'Kotlin (Android)', rank: 6, instruction: "Use ViewModel and StateFlow for state management. Implement dependency injection with Hilt. Use Coil for image loading.", cliCommand: "android create project --activity MainActivity --package com.example.myapp && ./gradlew addHiltDependencies addCoilDependencies", oneLineInstruction: "Create an Android project with Hilt and Coil dependencies." },
  { value: 'reactnative', label: 'React Native', info: 'JavaScript', rank: 7, instruction: "Use React Navigation for routing. Implement state management with Redux Toolkit. Consider using React Native Paper for UI components.", cliCommand: "npx react-native init MyApp --template react-native-template-typescript && npm install @react-navigation/native @reduxjs/toolkit react-native-paper", oneLineInstruction: "Create a React Native app with React Navigation, Redux Toolkit, and React Native Paper." },
  { value: 'solid', label: 'SolidJS', info: 'JavaScript', rank: 8, instruction: "Use SolidJS stores for state management. Implement routing with Solid Router. Consider using Tailwind CSS for styling.", cliCommand: "npx degit solidjs/templates/ts my-solid-project && npm install @solidjs/router tailwindcss postcss autoprefixer && npx tailwindcss init -p", oneLineInstruction: "Create a SolidJS project with Solid Router and Tailwind CSS." },
  { value: 'qwik', label: 'Qwik', info: 'TypeScript', rank: 9, instruction: "Use Qwik City for full-stack development. Implement state management with Qwik's createContextId. Consider using Tailwind CSS for styling.", cliCommand: "npm create qwik@latest && npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p", oneLineInstruction: "Create a Qwik project with Tailwind CSS integration." },
  { value: 'astro', label: 'Astro', info: 'JavaScript', rank: 10, instruction: "Use Astro's built-in components and partial hydration. Implement dynamic routes with Astro's file-based routing. Consider using Tailwind CSS for styling.", cliCommand: "npm create astro@latest -- --template basics && npx astro add tailwind", oneLineInstruction: "Create an Astro project with Tailwind CSS integration." },
  { value: 'elm', label: 'Elm', info: 'Elm', rank: 11, instruction: "Use elm-ui for layout and styling. Implement HTTP requests with elm/http. Consider using elm-spa for single-page application routing.", cliCommand: "elm init && elm install mdgriffith/elm-ui elm/http rtfeldman/elm-spa", oneLineInstruction: "Initialize an Elm project with elm-ui, elm/http, and elm-spa packages." },
];

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, localHtml }) => {
  const [selectedFramework, setSelectedFramework] = useState<string | undefined>();
  const [convertedCode, setConvertedCode] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [usageLeft, setUsageLeft] = useState<number | null>(null);

  const filteredFrameworks = useMemo(() => {
    return frameworks.filter(framework => 
      framework.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUsageLeft(userData.usageLeft || 0);
        } else {
          setUsageLeft(0);
          await setDoc(docRef, { usageLeft: 0 }, { merge: true });
        }
      } else {
        setUser(null);
        setUsageLeft(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleExport = useCallback(async () => {
    if (!selectedFramework || !user) return;
    setIsLoading(true);
    setError(null);

    const selectedFrameworkData = frameworks.find(f => f.value === selectedFramework);
    const instruction = selectedFrameworkData?.instruction || '';

    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        const currentUsageLeft = userData.usageLeft || 0;

        if (currentUsageLeft > 0) {
          const response = await fetch('/api/convertFramework', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              html: localHtml,
              framework: selectedFramework,
              instruction: instruction,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to convert code');
          }

          const data = await response.json();
          setConvertedCode(data.convertedCode);

          // Update usage count in Firebase
          await setDoc(docRef, { usageLeft: currentUsageLeft - 1 }, { merge: true });
          setUsageLeft(currentUsageLeft - 1);
        } else {
          setError('Usage limit reached. Please upgrade your plan.');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFramework, localHtml, user]);

  const handleDownload = () => {
    if (!convertedCode) return;
    const blob = new Blob([convertedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exported_${selectedFramework}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (convertedCode) {
      Prism.highlightAll();
    }
  }, [convertedCode]);

  const handleCopyToClipboard = () => {
    if (convertedCode) {
      navigator.clipboard.writeText(convertedCode);
      // Optionally, show a toast or some feedback that the code was copied
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const selectedFrameworkData = useMemo(() => {
    return frameworks.find(f => f.value === selectedFramework);
  }, [selectedFramework]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`bg-white text-black rounded-lg ${isFullScreen ? 'fixed inset-0 w-full h-full max-w-none' : 'sm:max-w-[600px]'}`}
        onPointerDown={stopEventPropagation}
        onPointerUp={stopEventPropagation}
        onPointerMove={stopEventPropagation}
        onTouchEnd={stopEventPropagation}
      >
        <DialogHeader>
          <DialogTitle>Export Options</DialogTitle>
          <DialogDescription>
            Convert your HTML to different frameworks.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="framework" className="text-right">
              Framework
            </Label>
            <div className="col-span-3">
              <Select onValueChange={setSelectedFramework} value={selectedFramework}>
                <SelectTrigger>
                  <SelectValue placeholder="Select framework" />
                </SelectTrigger>
                <SelectContent className="bg-white max-h-[200px] overflow-y-auto">
                  {filteredFrameworks.map((framework) => (
                    <SelectItem key={framework.value} value={framework.value}>
                      <div className="flex justify-between items-center">
                        <span>{framework.label}</span>
                        <span className="text-sm text-gray-500 ml-2">{framework.info}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-4">
          <DialogClose asChild>
            <Button variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleExport} disabled={!selectedFramework || isLoading || !user} variant="outline">
            {isLoading ? 'Converting...' : user ? `Convert` : 'Login to Convert'}
          </Button>
        </div>
        {error && (
          <p className="text-red-500 mt-2">{error}</p>
        )}
        {convertedCode && (
          <div className={`mt-2 ${isFullScreen ? 'h-full' : ''}`}>
            <div className="flex justify-between items-center mb-2">
              <div>
                <Button className="mr-2" onClick={handleCopyToClipboard}  variant="outline">
                  Copy
                </Button>
              </div>
            </div>
            <pre className={`line-numbers ${isFullScreen ? 'h-[calc(100vh-200px)]' : 'max-h-[400px]'} overflow-auto max-w-[550px]`}>
              <code className={`language-${selectedFramework}`}>
                {convertedCode}
              </code>
            </pre>
            <Button className="mt-2" onClick={handleDownload} variant="outline">
              Download
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};