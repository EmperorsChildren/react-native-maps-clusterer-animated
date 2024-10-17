import { useCallback, useEffect, useRef, useState } from 'react'
import {
  isPointCluster,
  supercluster as Supercluster,
  useClusterer,
} from 'react-native-clusterer'
import { MapMarker, MapMarkerProps, Region } from 'react-native-maps'
import Animated, {
  Easing,
  EasingFunction,
  EasingFunctionFactory,
  SharedValue,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

interface LatLng {
  latitude: number
  longitude: number
  longitudeDelta?: number
  latitudeDelta?: number
}

export interface AnimateOptions extends LatLng {
  duration?: number
  easing?: EasingFunction | EasingFunctionFactory
}

export const useAnimatedRegion = (location: Partial<LatLng> = {}) => {
  const latitude = useSharedValue(location.latitude)
  const longitude = useSharedValue(location.longitude)
  const latitudeDelta = useSharedValue(location.latitudeDelta)
  const longitudeDelta = useSharedValue(location.longitudeDelta)

  const animatedProps = useAnimatedProps(() => ({
    coordinate: {
      latitude: latitude.value ?? 0,
      longitude: longitude.value ?? 0,
      latitudeDelta: latitudeDelta.value ?? 0,
      longitudeDelta: longitudeDelta.value ?? 0,
    },
  }))

  const animate = useCallback(
    (options: AnimateOptions) => {
      const { duration = 500, easing = Easing.inOut(Easing.ease) } = options

      const animateValue = (
        value: SharedValue<number | undefined>,
        toValue?: number,
      ) => {
        if (!toValue) {
          return
        }

        value.value = withTiming(toValue, {
          duration,
          easing,
        })
      }

      animateValue(latitude, options.latitude)
      animateValue(longitude, options.longitude)
      animateValue(latitudeDelta, options.latitudeDelta)
      animateValue(longitudeDelta, options.longitudeDelta)
    },
    [latitude, longitude, latitudeDelta, longitudeDelta],
  )

  return {
    props: animatedProps,
    animate,
  }
}

export type MarkerProps = Omit<MapMarkerProps, 'coordinate'> & {
  coordinate?: MapMarkerProps['coordinate']
}

export const AnimatedMarker = Animated.createAnimatedComponent(
  MapMarker as React.ComponentClass<MarkerProps>,
)

export type IFeature = Supercluster.PointOrClusterFeature<any, any>

export type AnimatedClustersHookProps = {
  featuresToDisplay: IFeature[]
  mapDimensions: { width: number; height: number }
  region: Region
} & Supercluster.Options<any, any>

export const useAnimatedClusters = ({
  featuresToDisplay,
  mapDimensions,
  region,
  ...options
}: AnimatedClustersHookProps) => {
  const [points, supercluster] = useClusterer(
    featuresToDisplay,
    mapDimensions,
    region,
    { ...options },
  )

  const prevPoints = useRef(points)

  const [animatedPoints, setAnimatedPoints] = useState(points)

  useEffect(() => {
    function AnimateMarkers() {
      const prevClusters = prevPoints.current.flatMap((x) =>
        isPointCluster(x) ? x : [],
      )
      const nextClusters = points.flatMap((x) => (isPointCluster(x) ? x : []))

      // if (!isSameCluster(prevClusters, nextClusters)) {
      featuresToDisplay.forEach((originalMarker) => {
        const clusterThatWillContainTheOriginalMarker = nextClusters.find((x) =>
          supercluster
            .getChildren(x.properties.cluster_id)
            .find((m) => m.properties.id === originalMarker.properties.id),
        )

        if (clusterThatWillContainTheOriginalMarker) {
          // animate from picto coord to cluster coord
          const prevPointIndex = prevPoints.current.findIndex(
            (x) => x.properties.id === originalMarker.properties.id,
          )

          if (prevPointIndex >= 0) {
            prevPoints.current[prevPointIndex].properties.animate = {
              from: {
                latitude: originalMarker.geometry.coordinates[1],
                longitude: originalMarker.geometry.coordinates[0],
              },
              to: {
                latitude:
                  clusterThatWillContainTheOriginalMarker.geometry
                    .coordinates[1],
                longitude:
                  clusterThatWillContainTheOriginalMarker.geometry
                    .coordinates[0],
              },
            }
          }
        } else {
          // animate from previous cluster coord to picto coord
          const oldCluster = prevClusters.find((x) =>
            supercluster
              .getChildren(x.properties.cluster_id)
              .find((m) => m.id === originalMarker.id),
          )

          const pointIndex = points.findIndex(
            (x) => x.properties.id === originalMarker.properties.id,
          )

          if (oldCluster && pointIndex >= 0) {
            points[pointIndex].properties.animate = {
              from: {
                latitude: oldCluster.geometry.coordinates[1],
                longitude: oldCluster.geometry.coordinates[0],
              },
              to: {
                latitude: points[pointIndex].geometry.coordinates[1],
                longitude: points[pointIndex].geometry.coordinates[0],
              },
            }
          }
        }
      })
      // }

      setAnimatedPoints(prevPoints.current)

      prevPoints.current = points
    }

    AnimateMarkers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points])

  return animatedPoints
}

/**
 * test if the clusters are same
 * @param currentClusters
 * @param nextClusters
 */
// function isSameCluster(
//   currentClusters: Supercluster.ClusterFeature<supercluster.AnyProps>[],
//   nextClusters: Supercluster.ClusterFeature<supercluster.AnyProps>[],
// ): boolean {
//   if (currentClusters.length !== nextClusters.length) {
//     return false
//   }
//   for (let i = 0; i < currentClusters.length; i++) {
//     const currentCoordinate = currentClusters[i].geometry.coordinates
//     const nextCoordinate = nextClusters[i].geometry.coordinates
//     if (currentCoordinate[0] !== nextCoordinate[0]) {
//       return false
//     }
//     if (currentCoordinate[1] !== nextCoordinate[1]) {
//       return false
//     }
//   }
//   return true
// }
