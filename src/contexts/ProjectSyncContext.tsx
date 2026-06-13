/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { useAuth } from './AuthContext';
import { buildProjectSectionsFromState, useWallStore } from '../store/useWallStore';
import type { ProjectSnapshot } from '../types';
import {
  ProjectConflictError,
  deleteProjectFromFirestore,
  fetchProjectById,
  saveProjectToFirestore,
  subscribeProject,
  subscribeProjects,
} from '../services/firebaseService';

interface ProjectSyncContextValue {
  currentProjectId: string | null;
  currentVersion: number | null;
  currentProject: ProjectSnapshot | null;
  projects: ProjectSnapshot[];
  projectsLoading: boolean;
  isDirty: boolean;
  isSaving: boolean;
  isLoadingProject: boolean;
  conflictMessage: string | null;
  saveCurrentProject: (projectNameOverride?: string) => Promise<{ projectId: string; version: number }>;
  loadProject: (projectId: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  startNewProject: () => void;
  reloadCurrentProject: () => Promise<void>;
  clearConflict: () => void;
}

const ProjectSyncContext = createContext<ProjectSyncContextValue | null>(null);

export const ProjectSyncProvider = ({ children }: PropsWithChildren) => {
  const { firebaseUser, userProfile } = useAuth();
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentVersion, setCurrentVersion] = useState<number | null>(null);
  const [currentProject, setCurrentProject] = useState<ProjectSnapshot | null>(null);
  const [projects, setProjects] = useState<ProjectSnapshot[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);
  const isApplyingRemote = useRef(false);
  const dirtyRef = useRef(false);
  const versionRef = useRef<number | null>(null);
  const currentProjectIdRef = useRef<string | null>(null);

  useEffect(() => {
    dirtyRef.current = isDirty;
  }, [isDirty]);

  useEffect(() => {
    versionRef.current = currentVersion;
  }, [currentVersion]);

  useEffect(() => {
    currentProjectIdRef.current = currentProjectId;
  }, [currentProjectId]);

  useEffect(() => {
    const unsubscribe = useWallStore.subscribe((state, previousState) => {
      if (isApplyingRemote.current) {
        return;
      }

      const previousSerialized = JSON.stringify({
        projectName: previousState.projectName,
        sections: buildProjectSectionsFromState(previousState),
      });
      const nextSerialized = JSON.stringify({
        projectName: state.projectName,
        sections: buildProjectSectionsFromState(state),
      });

      if (previousSerialized !== nextSerialized) {
        setIsDirty(true);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!firebaseUser || !userProfile) {
      queueMicrotask(() => {
        setProjects([]);
        setProjectsLoading(false);
      });
      return;
    }

    queueMicrotask(() => {
      setProjectsLoading(true);
    });

    return subscribeProjects((nextProjects) => {
      setProjects(nextProjects);
      setProjectsLoading(false);
    });
  }, [firebaseUser, userProfile]);

  useEffect(() => {
    if (!currentProjectId) {
      queueMicrotask(() => {
        setCurrentProject(null);
      });
      return;
    }

    return subscribeProject(currentProjectId, (remoteProject) => {
      if (!remoteProject) {
        setConflictMessage('This project was removed from Firebase. Start a new project or load another one.');
        setCurrentProject(null);
        return;
      }

      setCurrentProject(remoteProject);

      if (versionRef.current === null) {
        return;
      }

      if (remoteProject.version === versionRef.current) {
        return;
      }

      if (dirtyRef.current && remoteProject.version > versionRef.current) {
        setConflictMessage(
          `This project was updated by ${remoteProject.lastEditedByEmail}. Reload it before saving again.`,
        );
        return;
      }

      isApplyingRemote.current = true;
      useWallStore
        .getState()
        .applyProjectSections(remoteProject.sections, remoteProject.projectName);
      setCurrentVersion(remoteProject.version);
      setIsDirty(false);
      setConflictMessage(null);
      queueMicrotask(() => {
        isApplyingRemote.current = false;
      });
    });
  }, [currentProjectId]);

  const loadProject = useCallback(async (projectId: string) => {
    setIsLoadingProject(true);

    try {
      const project = await fetchProjectById(projectId);

      if (!project) {
        throw new Error('project-not-found');
      }

      isApplyingRemote.current = true;
      useWallStore.getState().applyProjectSections(project.sections, project.projectName);
      setCurrentProject(project);
      setCurrentProjectId(project.id);
      setCurrentVersion(project.version);
      setIsDirty(false);
      setConflictMessage(null);
    } finally {
      queueMicrotask(() => {
        isApplyingRemote.current = false;
      });
      setIsLoadingProject(false);
    }
  }, []);

  const saveCurrentProject = useCallback(async (projectNameOverride?: string) => {
    if (!firebaseUser?.email) {
      throw new Error('auth-required');
    }

    if (isSaving) {
      throw new Error('save-in-progress');
    }

    if (conflictMessage) {
      throw new ProjectConflictError(conflictMessage);
    }

    setIsSaving(true);

    try {
      const currentState = useWallStore.getState();
      const projectName = projectNameOverride?.trim() || currentState.projectName.trim() || 'Untitled Retaining Wall Project';

      if (projectName !== currentState.projectName) {
        currentState.setProjectName(projectName);
      }

      const result = await saveProjectToFirestore({
        projectId: currentProjectId ?? undefined,
        projectName,
        ownerUid: firebaseUser.uid,
        ownerEmail: firebaseUser.email,
        state: {
          ...useWallStore.getState(),
        },
        lastKnownVersion: currentVersion,
      });

      setCurrentProjectId(result.projectId);
      setCurrentVersion(result.version);
      setIsDirty(false);
      setConflictMessage(null);

      const project = await fetchProjectById(result.projectId);
      setCurrentProject(project);

      return result;
    } finally {
      setIsSaving(false);
    }
  }, [conflictMessage, currentProjectId, currentVersion, firebaseUser, isSaving]);

  const deleteProject = useCallback(async (projectId: string) => {
    await deleteProjectFromFirestore(projectId);

    if (currentProjectIdRef.current === projectId) {
      setCurrentProjectId(null);
      setCurrentVersion(null);
      setCurrentProject(null);
      setConflictMessage(null);
      setIsDirty(false);
      useWallStore.getState().resetState();
    }
  }, []);

  const startNewProject = useCallback(() => {
    setCurrentProjectId(null);
    setCurrentVersion(null);
    setCurrentProject(null);
    setConflictMessage(null);
    setIsDirty(false);
    isApplyingRemote.current = true;
    useWallStore.getState().resetState();
    queueMicrotask(() => {
      isApplyingRemote.current = false;
    });
  }, []);

  const reloadCurrentProject = useCallback(async () => {
    if (!currentProjectIdRef.current) {
      return;
    }

    await loadProject(currentProjectIdRef.current);
  }, [loadProject]);

  const value = useMemo<ProjectSyncContextValue>(
    () => ({
      currentProjectId,
      currentVersion,
      currentProject,
      projects,
      projectsLoading,
      isDirty,
      isSaving,
      isLoadingProject,
      conflictMessage,
      saveCurrentProject,
      loadProject,
      deleteProject,
      startNewProject,
      reloadCurrentProject,
      clearConflict: () => setConflictMessage(null),
    }),
    [
      conflictMessage,
      currentProject,
      currentProjectId,
      currentVersion,
      deleteProject,
      isDirty,
      isLoadingProject,
      isSaving,
      loadProject,
      projects,
      projectsLoading,
      reloadCurrentProject,
      saveCurrentProject,
      startNewProject,
    ],
  );

  return <ProjectSyncContext.Provider value={value}>{children}</ProjectSyncContext.Provider>;
};

export const useProjectSync = () => {
  const context = useContext(ProjectSyncContext);

  if (!context) {
    throw new Error('useProjectSync must be used within ProjectSyncProvider');
  }

  return context;
};
