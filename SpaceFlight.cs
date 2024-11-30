using System;
using UdonSharp;
using UnityEngine;
using VRC.SDKBase;

public class SpaceFlight : UdonSharpBehaviour {
  private VRCPlayerApi player;
  private bool isInCollider = false;
  private Vector2 movement = new Vector2(0.0f, 0.0f);
  public float speed = 1.0f;
  public float smoothness = 1.0f;
  public float gravity = 0.001f;
  public GameObject[] col;

  void Start() {
    player = Networking.LocalPlayer;
  }

  void InputMoveVertical(float value, VRC.Udon.Common.UdonInputEventArgs args) {
    movement.y = value;
  }

  void InputMoveHorizontal(float value, VRC.Udon.Common.UdonInputEventArgs args) {
    movement.x = value;
  }

  void FixedUpdate() {
    float adjustedSpeed = Mathf.Min(Mathf.Max(speed, 0.01f), 5.0f);
    Vector3 maxVelocity = new Vector3(player.GetStrafeSpeed(), player.GetJumpImpulse(), player.GetRunSpeed()) * adjustedSpeed;
    Vector3 pos = player.GetPosition();
    bool isInCol = false;
    foreach (GameObject obj in col) {
      if (!obj.activeInHierarchy)
        continue;
      Collider collider = obj.GetComponent<Collider>();
      if (collider.bounds.Contains(pos)) {
        isInCol = true;
        break;
      }
    }
    if (isInCol != isInCollider)
      player.SetGravityStrength(isInCol ? Mathf.Min(Mathf.Max(gravity, 0.001f), 1.0f) : 1.0f);
    isInCollider = isInCol;
    if (!isInCollider)
      return;
    Quaternion rotation = player.GetTrackingData(VRCPlayerApi.TrackingDataType.Head).rotation;
    Vector3 currentVelocity = player.GetVelocity();
    Vector3 targetVelocity = rotation * new Vector3(movement.x * maxVelocity.x, 0.0f, movement.y * maxVelocity.y) * adjustedSpeed;
    Vector3 smoothedVelocity = Vector3.Lerp(currentVelocity, targetVelocity, 1.0f - Mathf.Exp(Mathf.Lerp(-1.0f, 0f, 1f - (1f / Mathf.Min(Mathf.Max(smoothness, 0.001f), 5.0f))) * Time.deltaTime));
    player.SetVelocity(smoothedVelocity);
  }
}